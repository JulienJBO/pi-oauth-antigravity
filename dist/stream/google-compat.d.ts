/**
 * Vendored from @earendil-works/pi-ai@0.86.1 (api/google-shared, MIT).
 * Local adaptation on top of upstream: only requiresToolCallId and its
 * Gemini version parser are kept.
 *
 * Pi extensions cannot rely on arbitrary @earendil-works/pi-ai deep runtime
 * imports: the extension loader only resolves the pi-ai root (compat),
 * /compat, /oauth and /providers/all, so importing pi-ai/api/* fails at load
 * time with "Cannot find module". This compatibility helper intentionally
 * keeps the extension self-contained.
 *
 * Upgrade: diff upstream packages/ai/src/api/google-shared.ts against
 * this file and re-apply the trimming.
 */
/**
 * Models via Google APIs that require explicit tool call IDs in function calls/responses.
 */
export declare function requiresToolCallId(modelId: string): boolean;
