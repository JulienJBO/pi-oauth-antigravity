import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import type { AccountUsage } from "../types/types.js";
export declare function fetchAccountUsage(apiKeyRaw?: string): Promise<AccountUsage>;
export declare function formatUsageSummary(usage: AccountUsage): string;
export declare function formatModelsList(usage: AccountUsage, opts?: {
    all?: boolean;
}): string;
export declare function resolveApiKeyFromContext(ctx: ExtensionCommandContext): Promise<string | undefined>;
