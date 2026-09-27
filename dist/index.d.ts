/**
 * Vendored from Rahularya01/pi-antigravity@0.6.0 (main 855c5fce, MIT).
 * Local patches on top of upstream:
 * - refreshAntigravityToken accepts and forwards the AbortSignal from Pi's
 *   refreshToken(credentials, signal) contract (pi 0.84+).
 * - redactSecrets also matches Google refresh tokens in the "1//04…"
 *   double-slash spelling (upstream regex only matched "1/04…").
 * Upgrade: diff upstream src/ against this directory and re-apply local patches,
 * then run `npx tsc -p .pi/extensions/tsconfig.json --noEmit && npm run test:extensions`.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
export default function (pi: ExtensionAPI): void;
