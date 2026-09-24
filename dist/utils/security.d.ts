/** Only loopback binds are allowed so OAuth codes cannot be stolen off-machine. */
export declare function resolveCallbackHost(raw?: string | undefined): string;
/** Prevent token exfiltration via poisoned BASE_URL (SSRF / credential leak). */
export declare function assertSafeApiBaseUrl(raw: string): string;
/** Redact bearer tokens, refresh tokens, and similar secrets from diagnostics/errors. */
export declare function redactSecrets(text: string): string;
export declare function maskEmail(email: string | undefined): string | undefined;
export declare function safeError(error: unknown): string;
