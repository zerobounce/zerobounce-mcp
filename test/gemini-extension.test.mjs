import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Gemini CLI extension gallery: gemini-extension.json at the repo root, pointing at the hosted server.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "gemini-extension.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

assert.equal(manifest.name, "zerobounce");
assert.match(manifest.name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
assert.equal(manifest.version, pkg.version, "keep the extension version in step with package.json");
assert.ok(manifest.description);

const server = manifest.mcpServers.zerobounce;
assert.equal(server.httpUrl, "https://mcp.zerobounce.net/mcp");
assert.ok(!server.command, "hosted extension should not spawn a local command");
assert.ok(!("headers" in server), "OAuth is discovered from the server; no key or header");
assert.ok(!("trust" in server), "extensions may not set trust");
