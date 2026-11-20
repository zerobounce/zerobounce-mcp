import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(root, "plugins", "zerobounce");

const manifest = JSON.parse(
  readFileSync(join(pluginRoot, ".cursor-plugin", "plugin.json"), "utf8"),
);
assert.equal(manifest.name, "zerobounce");
assert.equal(manifest.displayName, "ZeroBounce");
assert.equal(manifest.mcpServers, "./mcp.json");
assert.equal(manifest.skills, "./skills/");
assert.equal(manifest.rules, "./rules/");
assert.equal(manifest.agents, "./agents/");
assert.equal(manifest.commands, "./commands/");
assert.ok(readFileSync(join(pluginRoot, manifest.logo), "utf8").includes("<svg"));

const mcp = JSON.parse(readFileSync(join(pluginRoot, "mcp.json"), "utf8"));
const server = mcp.mcpServers.zerobounce;
assert.equal(server.type, "http");
assert.equal(server.url, "https://mcp.zerobounce.net/mcp");
assert.ok(!("headers" in server));

const marketplace = JSON.parse(
  readFileSync(join(root, ".cursor-plugin", "marketplace.json"), "utf8"),
);
assert.equal(marketplace.metadata.pluginRoot, undefined);
const entry = marketplace.plugins.find((plugin) => plugin.name === "zerobounce");
assert.equal(entry.source, "plugins/zerobounce");
assert.ok(readFileSync(join(root, entry.source, ".cursor-plugin", "plugin.json"), "utf8"));

for (const name of readdirSync(join(pluginRoot, "skills"))) {
  const text = readFileSync(join(pluginRoot, "skills", name, "SKILL.md"), "utf8");
  assert.match(text, new RegExp(`name:\\s*${name}`));
  assert.ok(text.includes("https://mcp.zerobounce.net/mcp"));
}

for (const file of readdirSync(join(pluginRoot, "rules"))) {
  const text = readFileSync(join(pluginRoot, "rules", file), "utf8");
  assert.match(text, /^---\n/);
  assert.match(text, /description:/);
}

for (const file of readdirSync(join(pluginRoot, "agents"))) {
  const text = readFileSync(join(pluginRoot, "agents", file), "utf8");
  assert.match(text, /name:/);
  assert.match(text, /zerobounce/);
}

for (const file of readdirSync(join(pluginRoot, "commands"))) {
  const text = readFileSync(join(pluginRoot, "commands", file), "utf8");
  assert.match(text, /name:/);
  assert.match(text, /zerobounce|get_credits|validate|send_file|find_email|inbox/);
}

console.log("cursor-plugin: ok");
