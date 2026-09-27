import type { AntigravityApiKey, DynamicModelInfo } from "../types/types.js";
export declare const DEFAULT_ENDPOINT = "https://daily-cloudcode-pa.googleapis.com";
export declare const ENDPOINT_FALLBACKS: string[];
/** UUID-shaped stable id from a seed (account email preferred over cwd). */
export declare function stableProjectId(seed: string): string;
/**
 * Fallback project id when discovery fails.
 * Prefer ANTIGRAVITY_PROJECT_ID, then a stable seed (email), never process.cwd().
 */
export declare function defaultProjectId(seed?: string): string;
/** @deprecated Use defaultProjectId(seed); kept for scripts that imported the old constant. */
export declare const DEFAULT_PROJECT_ID: string;
export declare function endpointCandidates(preferredEndpoint?: string): string[];
export declare function antigravityHeaders(token: string): Record<string, string>;
export declare function jsonOrTextError(text: string): string;
export declare function parseApiKey(apiKeyRaw: string | undefined): AntigravityApiKey;
export declare function extractProjectId(data: unknown): string | undefined;
/** Runtime ids look like gemini-*, claude-*, gpt-oss-*, never MODEL_PLACEHOLDER_* enums. */
export declare function isUsableRuntimeModelId(id: string): boolean;
export declare function fetchAvailableRuntimeModel(token: string, projectId: string, requestedRuntimeModel: string): Promise<DynamicModelInfo | undefined>;
export declare function clearModelCache(): void;
/** Discover project id with a short in-memory LRU cache keyed by access token. */
export declare function loadCodeAssist(token: string): Promise<string | undefined>;
export declare function clearProjectCache(): void;
export declare function resolveProjectId(opts: {
    token: string;
    credentialProjectId?: string;
    email?: string;
    warmedProject?: string | null;
}): string;
/** Build a diagnostic suffix using the active request bag. */
export declare function formatRequestDiagnostics(extra: {
    projectId: string;
    runtimeModel: string;
}): string;
