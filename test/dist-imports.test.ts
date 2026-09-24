import test from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");

/**
 * Subpaths Pi's extension loader actually resolves (the jiti alias /
 * virtual-module table of @earendil-works/pi-coding-agent). Every other
 * @earendil-works subpath — in particular pi-ai/api/* and pi-ai/utils/* —
 * falls back to plain Node resolution from the extension's install directory
 * and breaks at runtime with "Cannot find module".
 */
const RESOLVABLE_SPECIFIERS = new Set([
	"@earendil-works/pi-ai",
	"@earendil-works/pi-ai/compat",
	"@earendil-works/pi-ai/oauth",
	"@earendil-works/pi-ai/providers/all",
	"@earendil-works/pi-agent-core",
	"@earendil-works/pi-coding-agent",
	"@earendil-works/pi-tui",
]);

function listJsFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) files.push(...listJsFiles(path));
		else if (entry.name.endsWith(".js")) files.push(path);
	}
	return files;
}

test("dist contains no runtime import of unresolvable @earendil-works subpaths", () => {
	execSync("npm run build", { cwd: repoRoot, stdio: "pipe" });

	const distDir = join(repoRoot, "dist");
	const files = listJsFiles(distDir);
	assert.ok(files.length > 0, "dist must be built before this guard can run");

	const offenders: string[] = [];
	const specifierPattern = /@earendil-works\/[a-z-]+(?:\/[a-zA-Z0-9_/.-]+)?/g;
	for (const file of files) {
		const relative = file.slice(repoRoot.length + 1);
		for (const specifier of readFileSync(file, "utf8").matchAll(specifierPattern)) {
			if (!RESOLVABLE_SPECIFIERS.has(specifier[0])) {
				offenders.push(`${relative}: ${specifier[0]}`);
			}
		}
	}

	assert.deepEqual(
		offenders,
		[],
		"dist must only import @earendil-works specifiers that Pi's extension loader resolves",
	);
});
