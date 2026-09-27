/**
 * Vendored from @earendil-works/pi-ai@0.86.1 (api/constrained-sampling, MIT).
 * Local adaptation on top of upstream: only the JSON-schema helpers this
 * extension needs are kept; grammar constrained sampling is dropped.
 *
 * Pi extensions cannot rely on arbitrary @earendil-works/pi-ai deep runtime
 * imports: the extension loader only resolves the pi-ai root (compat),
 * /compat, /oauth and /providers/all, so importing pi-ai/api/* fails at load
 * time with "Cannot find module". This compatibility helper intentionally
 * keeps the extension self-contained.
 *
 * Upgrade: diff upstream packages/ai/src/api/constrained-sampling.ts against
 * this file and re-apply the trimming.
 */
import type { Tool } from "@earendil-works/pi-ai";

class UnsupportedStrictJsonSchemaError extends Error {}

const UNSUPPORTED_STRICT_SCHEMA_KEYS = [
  "$ref",
  "$defs",
  "definitions",
  "allOf",
  "oneOf",
  "patternProperties",
  "dependentSchemas",
  "dependencies",
  "unevaluatedProperties",
  "propertyNames",
  "contains",
  "prefixItems",
  "not",
  "if",
  "then",
  "else",
];

function isJsonSchemaObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStructuredSchema(schema: unknown): boolean {
  if (!isJsonSchemaObject(schema)) return false;
  const types = typeof schema.type === "string" ? [schema.type] : Array.isArray(schema.type) ? schema.type : [];
  return (
    types.includes("object") ||
    types.includes("array") ||
    schema.properties !== undefined ||
    schema.items !== undefined
  );
}

function schemaAllowsNull(schema: unknown): boolean {
  if (!isJsonSchemaObject(schema)) return false;
  if (schema.type === "null" || (Array.isArray(schema.type) && schema.type.includes("null"))) return true;
  if (schema.const === null || (Array.isArray(schema.enum) && schema.enum.includes(null))) return true;
  return Array.isArray(schema.anyOf) && schema.anyOf.some((variant) => schemaAllowsNull(variant));
}

function makeJsonSchemaNodeStrict(schema: Record<string, unknown>): void {
  if (!isJsonSchemaObject(schema)) {
    throw new UnsupportedStrictJsonSchemaError("boolean schemas are unsupported");
  }
  for (const key of UNSUPPORTED_STRICT_SCHEMA_KEYS) {
    if (schema[key] !== undefined) {
      throw new UnsupportedStrictJsonSchemaError(`${key} schemas are unsupported`);
    }
  }
  if (schema.anyOf !== undefined) {
    if (!Array.isArray(schema.anyOf) || schema.anyOf.length === 0) {
      throw new UnsupportedStrictJsonSchemaError("anyOf must contain at least one schema");
    }
    for (const variant of schema.anyOf) {
      if (isStructuredSchema(variant)) {
        throw new UnsupportedStrictJsonSchemaError("object and array unions are unsupported");
      }
      makeJsonSchemaNodeStrict(variant as Record<string, unknown>);
    }
  }
  if (schema.items !== undefined) {
    if (Array.isArray(schema.items)) {
      throw new UnsupportedStrictJsonSchemaError("tuple schemas are unsupported");
    }
    makeJsonSchemaNodeStrict(schema.items as Record<string, unknown>);
  }
  const isObjectSchema = schema.type === "object";
  if (schema.properties !== undefined && !isObjectSchema) {
    throw new UnsupportedStrictJsonSchemaError("properties require type object");
  }
  if (!isObjectSchema) return;
  if (schema.additionalProperties !== undefined && schema.additionalProperties !== false) {
    throw new UnsupportedStrictJsonSchemaError("schema-valued or true additionalProperties is unsupported");
  }
  if (schema.properties !== undefined && !isJsonSchemaObject(schema.properties)) {
    throw new UnsupportedStrictJsonSchemaError("object properties must be a schema map");
  }
  if (
    schema.required !== undefined &&
    (!Array.isArray(schema.required) || schema.required.some((key) => typeof key !== "string"))
  ) {
    throw new UnsupportedStrictJsonSchemaError("object required must be a string array");
  }
  const properties = (schema.properties ?? {}) as Record<string, unknown>;
  const propertyNames = Object.keys(properties);
  const required = new Set(Array.isArray(schema.required) ? (schema.required as string[]) : []);
  if ([...required].some((key) => !propertyNames.includes(key))) {
    throw new UnsupportedStrictJsonSchemaError("required contains an unknown property");
  }
  for (const [key, property] of Object.entries(properties)) {
    makeJsonSchemaNodeStrict(property as Record<string, unknown>);
    if (!required.has(key) && !schemaAllowsNull(property)) {
      properties[key] = { anyOf: [property, { type: "null" }] };
    }
  }
  schema.required = propertyNames;
  schema.additionalProperties = false;
}

/** Convert a tool schema to the strict subset expected by provider constrained sampling. */
function makeStrictJsonSchema(schema: Tool["parameters"]): Tool["parameters"] {
  const cloned = structuredClone(schema);
  if (!isJsonSchemaObject(cloned)) {
    throw new UnsupportedStrictJsonSchemaError("root schema must have type object");
  }
  makeJsonSchemaNodeStrict(cloned);
  if (cloned.type !== "object") {
    throw new UnsupportedStrictJsonSchemaError("root schema must have type object");
  }
  return cloned as Tool["parameters"];
}

export function getJsonSchemaToolParameters(tool: Tool, strict: boolean | undefined): Tool["parameters"] {
  return strict === true ? makeStrictJsonSchema(tool.parameters) : tool.parameters;
}

export function resolveJsonSchemaStrictSampling(tool: Tool, supportsStrictMode: boolean): boolean | undefined {
  const config = tool.constrainedSampling;
  if (!config || config.type !== "json_schema") return undefined;
  if (supportsStrictMode) {
    try {
      makeStrictJsonSchema(tool.parameters);
      return true;
    } catch (error) {
      if (!(error instanceof UnsupportedStrictJsonSchemaError)) throw error;
      if (config.strict !== "require") return undefined;
      throw new Error(`Tool "${tool.name}" requires JSON-schema constrained sampling, but ${error.message}.`);
    }
  }
  if (config.strict === "require") {
    throw new Error(`Tool "${tool.name}" requires JSON-schema constrained sampling, but strict tools are unsupported.`);
  }
  return undefined;
}
