import test from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverAndLoadExtensions } from "@earendil-works/pi-coding-agent";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

/**
 * Regression test for the extension-loading failure reported against Pi's
 * current extension runtime:
 *
 *   Failed to load extension "…/dist/index.js":
 *   Cannot find module '@earendil-works/pi-ai/api/constrained-sampling'
 *
 * Pi's extension loader resolves extension imports through jiti with a
 * restricted alias/virtual-module table (@earendil-works/pi-ai root, /compat,
 * /oauth and /providers/all only). Deep subpaths such as api/* fall back to
 * plain Node resolution from the extension's install directory, where pi-ai
 * does not exist.
 *
 * This test loads the real built bundle through the real Pi loader. It must
 * NOT be satisfied by `npm test` alone passing against src/: the repo's own
 * node_modules contains the full pi-ai package, which masks the failure. The
 * dist tree is therefore copied to a sandbox outside the repository so Node
 * resolution sees no pi-ai, exactly like a real Pi install.
 */
test("dist loads through Pi's extension loader without unresolvable deep pi-ai imports", async () => {
	process.env.ANTIGRAVITY_NO_PREWARM = "1";

	// Always rebuild: the test targets the distributed bundle, not the sources.
	execSync("npm run build", { cwd: repoRoot, stdio: "pipe" });

	const sandbox = mkdtempSync(join(tmpdir(), "antigravity-loader-"));
	try {
		const distCopy = join(sandbox, "dist");
		cpSync(join(repoRoot, "dist"), distCopy, { recursive: true });

		// Empty agent dir + sandbox cwd: only the entry under test is loaded,
		// never the developer's own ~/.pi/agent extensions.
		const { extensions, errors } = await discoverAndLoadExtensions(
			[join(distCopy, "index.js")],
			sandbox,
			join(sandbox, "agent"),
		);

		assert.deepEqual(
			errors.map((error) => error.error),
			[],
			"extension must load through the real Pi loader without module resolution errors",
		);
		assert.equal(extensions.length, 1, "exactly the antigravity extension should load");
		for (const command of ["antigravity.usage", "antigravity.models", "antigravity.doctor"]) {
			assert.ok(
				extensions[0]!.commands.has(command),
				`extension should register /${command}`,
			);
		}
	} finally {
		rmSync(sandbox, { recursive: true, force: true });
	}
});
