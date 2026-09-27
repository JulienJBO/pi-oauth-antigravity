export declare function antigravityEnv(name: string): string | undefined;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function asString(value: unknown): string | undefined;
export declare function sanitizeText(text: unknown): string;
export declare function escapeHtml(text: string): string;
export declare function escapeRegExp(text: string): string;
export declare function deriveSignedDecimalFromHash(text: string): string;
export declare function randomSignedDecimalSessionId(): string;
export declare function getFirstUserTextForAntigravitySession(context?: {
    messages?: Array<{
        role: string;
        content?: unknown;
    }>;
}): string | undefined;
export declare function deriveAntigravitySessionId(context?: {
    messages?: Array<{
        role: string;
        content?: unknown;
    }>;
}): string;
export interface AntigravitySessionState {
    agentId: string;
    trajectoryId: string;
    sessionId: string;
    stepIndex: number;
    lastExecutionId?: string;
    lastGoodEndpoint?: string;
    lastUsedAt: number;
}
export declare function persistAntigravitySessions(): void;
/** Reset in-memory cache and load state to simulate a fresh process restart. */
export declare function resetAntigravitySessionMemory(): void;
export declare function clearAntigravitySessions(): void;
export declare function getOrCreateAntigravitySession(sessionId: string): AntigravitySessionState;
export declare function nowRequestId(): string;
export declare function antigravityRequestEnvelope(wireModelId: string, isClaude: boolean, state?: AntigravitySessionState): {
    requestId: string;
    sessionId: string;
    labels: Record<string, string>;
};
