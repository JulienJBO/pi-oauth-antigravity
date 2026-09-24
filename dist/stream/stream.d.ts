import { type Api, type AssistantMessage, type AssistantMessageEventStream, type Model, type TranscriptContext, type Tool } from "@earendil-works/pi-ai";
import { StopReason } from "../types/enums.js";
import { ANTIGRAVITY_API, type AntigravityGenerateRequest, type AntigravityStreamOptions, type GeminiContent, type GeminiFunctionDeclaration } from "../types/types.js";
import { type AntigravitySessionState } from "../utils/util.js";
export { ANTIGRAVITY_API };
/** Plan quota is deterministic; everything else on a 429 is a transient throttle. */
export declare function isPlanQuotaError(status: number | undefined, text: string): boolean;
/** Exported for unit tests. */
export declare function convertMessages(model: Model<Api>, context: TranscriptContext, runtimeModel: string): GeminiContent[];
/**
 * Gemini accepts JSON Schema through parametersJsonSchema. Claude and GPT-OSS
 * use Cloud Code Assist's custom-tool bridge, which requires a compatible
 * Draft 2020-12 subset in the legacy parameters field.
 */
export declare function convertTools(tools: Tool[] | undefined, useLegacyParameters?: boolean, supportsStrictMode?: boolean): {
    functionDeclarations: GeminiFunctionDeclaration[];
}[] | undefined;
/** Exported for unit tests. */
export declare function buildRequest(model: Model<Api>, context: TranscriptContext, projectId: string, options: AntigravityStreamOptions, runtimeModel: string, sessionState?: AntigravitySessionState): AntigravityGenerateRequest;
/** Exported for unit tests. */
export declare function mapStopReason(reason: string | undefined): StopReason;
/** Exported for unit tests. */
export declare function friendlyAntigravityError(status: number | undefined, text: string): string;
/** Exported for unit tests. */
export declare function streamResponse(response: Response, stream: AssistantMessageEventStream, output: AssistantMessage, model?: Model<Api>, sessionState?: AntigravitySessionState): Promise<boolean>;
export declare function streamAntigravity(model: Model<Api>, context: TranscriptContext, options?: AntigravityStreamOptions): AssistantMessageEventStream;
