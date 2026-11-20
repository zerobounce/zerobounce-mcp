import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(root, "plugins", "zerobounce");

const manifest = JSON.parse(
  readFileSync(join(pluginRoot, ".cursor-plugin", "plugin.json"), "utf8"),
);
assert.equal(manifest.name, "zerobounce");
assert.equal(manifest.displayName, "ZeroBounce");
assert.match(manifest.name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
assert.ok(manifest.version && manifest.description);
assert.ok(manifest.logo);
assert.ok(
  readFileSync(join(pluginRoot, manifest.logo), "utf8").includes("<svg"),
  "logo should be SVG",
);

const mcp = JSON.parse(readFileSync(join(pluginRoot, "mcp.json"), "utf8"));
const server = mcp.mcpServers.zerobounce;
assert.equal(server.url, "https://mcp.zerobounce.net/mcp");
assert.ok(!server.command, "hosted plugin should not spawn a local command");
assert.ok(!("headers" in server));

const marketplace = JSON.parse(
  readFileSync(join(root, ".cursor-plugin", "marketplace.json"), "utf8"),
);
assert.equal(marketplace.metadata.pluginRoot, "plugins");
const entry = marketplace.plugins.find((plugin) => plugin.name === "zerobounce");
assert.ok(entry, "marketplace.json must list the zerobounce plugin");
assert.equal(entry.source, "zerobounce");
assert.ok(
  readFileSync(
    join(root, marketplace.metadata.pluginRoot, entry.source, ".cursor-plugin", "plugin.json"),
    "utf8",
  ),
);

const skill = readFileSync(join(pluginRoot, "skills", "zerobounce", "SKILL.md"), "utf8");
assert.ok(skill.startsWith("---\n"));
const fm = skill.split("---\n")[1];
assert.match(fm, /name:\s*zerobounce/);
assert.match(skill, /valid@example\.com/);

console.log("cursor-plugin: ok");
