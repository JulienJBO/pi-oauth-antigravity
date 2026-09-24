import type { OAuthCredentials, OAuthLoginCallbacks } from "@earendil-works/pi-ai";
import type { AntigravityOAuthCredentials } from "../types/types.js";
export declare const REDIRECT_URI = "http://localhost:51121/oauth-callback";
export declare const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export declare const TOKEN_URL = "https://oauth2.googleapis.com/token";
export declare const OAUTH_CALLBACK_TIMEOUT_MS: number;
export declare const SCOPES: string[];
/**
 * Default OAuth client is Google's public Antigravity desktop client (not a private app secret).
 * Prefer ANTIGRAVITY_CLIENT_ID / ANTIGRAVITY_CLIENT_SECRET when you manage your own OAuth app.
 */
export declare const CLIENT_ID: string;
export declare const CLIENT_SECRET: string;
export declare const CALLBACK_HOST: string;
export declare function loginAntigravity(callbacks: OAuthLoginCallbacks): Promise<AntigravityOAuthCredentials>;
export declare function refreshAntigravityToken(credentials: OAuthCredentials, signal?: AbortSignal): Promise<AntigravityOAuthCredentials>;
export declare function getApiKey(credentials: OAuthCredentials): string;
export type { OAuthCredentials, OAuthLoginCallbacks } from "@earendil-works/pi-ai";
