import test from "node:test";
import assert from "node:assert/strict";
import type { Tool } from "@earendil-works/pi-ai";
import { getJsonSchemaToolParameters, resolveJsonSchemaStrictSampling } from "../src/stream/constrained-sampling.js";
import { requiresToolCallId } from "../src/stream/google-compat.js";

function tool(overrides: Partial<Tool> = {}): Tool {
	return {
		name: "read",
		description: "read a file",
		parameters: {
			type: "object",
			properties: {
				path: { type: "string" },
				offset: { type: "number" },
			},
			required: ["path"],
		},
		...overrides,
	} as Tool;
}

test("requiresToolCallId matches the models Antigravity routes", (t) => {
	const cases: Array<[string, boolean]> = [
		["gemini-3.8-flash", true],
		["gemini-3.7-flash", true],
		["gemini-3-pro", true],
		["gemini-2.5-pro", false],
		["gemini-2.0-flash", false],
		["gemini-live-3.1", true],
		["claude-sonnet-4", true],
		["gpt-oss-120b", true],
		["gpt-4o", false],
	];
	for (const [modelId, expected] of cases) {
		assert.equal(requiresToolCallId(modelId), expected, modelId);
	}
});

test("getJsonSchemaToolParameters returns parameters unchanged when strict is not true", () => {
	const input = tool();
	assert.equal(getJsonSchemaToolParameters(input, undefined), input.parameters);
	assert.equal(getJsonSchemaToolParameters(input, false), input.parameters);
});

test("getJsonSchemaToolParameters rewrites optional properties for strict mode", () => {
	const strict = getJsonSchemaToolParameters(tool(), true) as Record<string, unknown>;
	assert.deepEqual(strict.required, ["path", "offset"]);
	assert.equal(strict.additionalProperties, false);
	const properties = strict.properties as Record<string, Record<string, unknown>>;
	assert.equal(properties.path.type, "string");
	assert.deepEqual(properties.offset.anyOf, [{ type: "number" }, { type: "null" }]);
});

test("getJsonSchemaToolParameters leaves nullable optional properties unwrapped", () => {
	const withNullable = tool({
		parameters: {
			type: "object",
			properties: {
				path: { type: "string" },
				tag: { anyOf: [{ type: "string" }, { type: "null" }] },
			},
			required: ["path"],
		},
	});
	const strict = getJsonSchemaToolParameters(withNullable, true) as Record<string, unknown>;
	const properties = strict.properties as Record<string, Record<string, unknown>>;
	assert.deepEqual(properties.tag, { anyOf: [{ type: "string" }, { type: "null" }] });
});

test("getJsonSchemaToolParameters rejects unsupported strict schema keywords", () => {
	const withRef = tool({
		parameters: {
			type: "object",
			properties: { path: { $ref: "#/$defs/name" } },
			required: ["path"],
		},
	});
	assert.throws(
		() => getJsonSchemaToolParameters(withRef, true),
		/\$ref schemas are unsupported/,
	);
});

test("getJsonSchemaToolParameters does not mutate the input schema", () => {
	const input = tool();
	const snapshot = JSON.stringify(input.parameters);
	getJsonSchemaToolParameters(input, true);
	assert.equal(JSON.stringify(input.parameters), snapshot);
});

test("resolveJsonSchemaStrictSampling returns undefined without a json_schema config", () => {
	assert.equal(resolveJsonSchemaStrictSampling(tool(), true), undefined);
	assert.equal(resolveJsonSchemaStrictSampling(tool({ constrainedSampling: false }), true), undefined);
});

test("resolveJsonSchemaStrictSampling prefers strict mode when the schema allows it", () => {
	const prefer = tool({ constrainedSampling: { type: "json_schema", strict: "prefer" } });
	assert.equal(resolveJsonSchemaStrictSampling(prefer, true), true);
	assert.equal(resolveJsonSchemaStrictSampling(prefer, false), undefined);
});

test("resolveJsonSchemaStrictSampling falls back when a prefer tool cannot go strict", () => {
	const preferWithRef = tool({
		constrainedSampling: { type: "json_schema", strict: "prefer" },
		parameters: {
			type: "object",
			properties: { path: { $ref: "#/$defs/name" } },
			required: ["path"],
		},
	});
	assert.equal(resolveJsonSchemaStrictSampling(preferWithRef, true), undefined);
});

test("resolveJsonSchemaStrictSampling throws when strict mode is required but unavailable", () => {
	const require = tool({ constrainedSampling: { type: "json_schema", strict: "require" } });
	assert.throws(
		() => resolveJsonSchemaStrictSampling(require, false),
		/requires JSON-schema constrained sampling, but strict tools are unsupported/,
	);
	const requireWithRef = tool({
		constrainedSampling: { type: "json_schema", strict: "require" },
		parameters: {
			type: "object",
			properties: { path: { $ref: "#/$defs/name" } },
			required: ["path"],
		},
	});
	assert.throws(
		() => resolveJsonSchemaStrictSampling(requireWithRef, true),
		/requires JSON-schema constrained sampling, but \$ref schemas are unsupported/,
	);
});
