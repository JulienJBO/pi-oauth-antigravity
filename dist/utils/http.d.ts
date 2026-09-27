/** fetch() bound to this provider's keep-alive connection pool when available. */
export declare function antigravityFetch(input: string | URL, init?: RequestInit): Promise<Response>;
/**
 * Open the TLS connection when the extension loads so the first message of a session
 * does not pay the handshake either. Best-effort: failures are ignored.
 */
export declare function prewarmConnection(url: string): void;
