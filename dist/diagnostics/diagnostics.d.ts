export type DiagnosticsSnapshot = {
    status?: number;
    endpoint?: string;
    error?: string;
    projectId?: string;
    resolvedRuntimeModel?: string;
    availableModels?: string;
    matchedModelDebug?: string;
    latencyMs?: number;
    maskedEmail?: string;
    tokenExpiry?: string;
};
/** Run work with an isolated diagnostics bag; commits it to `lastSnapshot` when done. */
export declare function runWithDiagnostics<T>(fn: () => Promise<T>): Promise<T>;
export declare function getLastDiagnostics(): Readonly<DiagnosticsSnapshot>;
/** Read endpoint from the active request bag (or last snapshot outside a request). */
export declare function getCurrentEndpoint(): string | undefined;
export declare function getCurrentMatchedModelDebug(): string | undefined;
export declare function getCurrentAvailableModels(): string | undefined;
export declare function setLastStatus(status: number | undefined): void;
export declare function setLastEndpoint(endpoint: string | undefined): void;
export declare function setLastError(error: string | undefined): void;
export declare function setLastProjectId(projectId: string | undefined): void;
export declare function setLastResolvedRuntimeModel(model: string | undefined): void;
export declare function setLastAvailableModels(models: string | undefined): void;
export declare function setLastMatchedModelDebug(debug: string | undefined): void;
export declare function setLastLatencyMs(ms: number | undefined): void;
export declare function setLastMaskedEmail(email: string | undefined): void;
export declare function setLastTokenExpiry(expiry: string | undefined): void;
/** Test helper: reset last snapshot between cases. */
export declare function resetDiagnosticsForTests(): void;
