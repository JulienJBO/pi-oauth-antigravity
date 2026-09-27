import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent";
import type { AntigravityRouting } from "../types/types.js";
export declare const PROVIDER_ID = "antigravity";
export declare const PROVIDER_NAME = "Antigravity";
/**
 * Public selectable model IDs → backend request model IDs by thinking effort.
 *
 * Catalog mirrors `agy models` (Antigravity CLI), which currently advertises:
 * - Gemini 3.8 Flash (Low / Medium / High)
 * - Gemini 3.7 Flash (Low / Medium / High)
 * - Gemini 3.6 Flash (Low / Medium / High)
 * - Gemini 3.5 Flash (Low / Medium / High)
 * - Gemini 3.1 Pro (Low / High)
 * - Claude Sonnet 4.6 (Thinking)
 * - Claude Opus 4.6 (Thinking)
 * - GPT-OSS 120B (Medium)
 *
 * Pi exposes those as public model IDs and only surfaces the exact thinking levels
 * advertised by the backend for each model.
 */
export declare const ANTIGRAVITY_ROUTING: Record<string, AntigravityRouting>;
/**
 * Verified maximum output tokens accepted by the Cloud Code Assist backend per model/runtime ID.
 * Requesting more than these limits returns a 400 Bad Request from the API.
 */
export declare const RUNTIME_MAX_OUTPUT_TOKENS: Record<string, number>;
export declare function getMaxOutputTokens(modelId: string, runtimeModel?: string): number;
/** Same set as `agy models`, collapsed to public Pi model IDs. */
export declare const ANTIGRAVITY_MODELS: ProviderModelConfig[];
/** Resolve public model id + thinking effort to Antigravity runtime model id. */
export declare function getAntigravityRequestModelId(modelId: string, effort: string | undefined): string;
/**
 * If a next-gen model (e.g. Gemini 3.7 Flash) is not yet available on the backend,
 * provide a fallback runtime model ID (e.g. Gemini 3.6 Flash) to maintain availability.
 */
export declare function getFallbackRuntimeModel(runtimeModel: string, effort?: string): string | undefined;
export type GeminiThinkingLevel = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
export type ThinkingWire = {
    includeThoughts: boolean;
    thinkingLevel?: GeminiThinkingLevel;
    thinkingBudget?: number;
};
export declare const ANTIGRAVITY_MODEL_ENUM: Record<string, string>;
export declare function getThinkingConfig(modelId: string, effort: string | undefined): ThinkingWire | undefined;
