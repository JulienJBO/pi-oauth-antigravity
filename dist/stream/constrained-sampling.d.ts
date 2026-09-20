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
export declare function getJsonSchemaToolParameters(tool: Tool, strict: boolean | undefined): Tool["parameters"];
export declare function resolveJsonSchemaStrictSampling(tool: Tool, supportsStrictMode: boolean): boolean | undefined;
