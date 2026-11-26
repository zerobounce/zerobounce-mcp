import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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
// Streamable HTTP; Gemini CLI marks the older "httpUrl" key as deprecated.
assert.equal(server.type, "http");
assert.equal(server.url, "https://mcp.zerobounce.net/mcp");
assert.ok(!("httpUrl" in server));
assert.ok(!server.command, "hosted extension should not spawn a local command");
assert.ok(!("headers" in server), "OAuth is discovered from the server; no key or header");
assert.ok(!("trust" in server), "extensions may not set trust");

// Context file, loaded into every Gemini session that has the extension.
assert.equal(manifest.contextFileName, "GEMINI.md");
const context = readFileSync(join(root, manifest.contextFileName), "utf8");
assert.ok(context.includes("https://mcp.zerobounce.net/mcp"));
assert.ok(context.includes("get_credits"));

// Gemini reads skills from skills/ at the extension root; Cursor reads plugins/zerobounce/skills/.
// The two are copies of one set: edit plugins/zerobounce/skills/, then
// `rm -rf skills && cp -R plugins/zerobounce/skills skills`.
const cursorSkills = join(root, "plugins", "zerobounce", "skills");
const geminiSkills = join(root, "skills");
const names = readdirSync(cursorSkills).sort();
assert.ok(names.length > 0);
assert.deepEqual(
  readdirSync(geminiSkills).sort(),
  names,
  "skills/ must hold the same skills as plugins/zerobounce/skills/",
);
for (const name of names) {
  const file = join(geminiSkills, name, "SKILL.md");
  assert.ok(existsSync(file), `skills/${name}/SKILL.md is missing`);
  const text = readFileSync(file, "utf8");
  assert.equal(
    text,
    readFileSync(join(cursorSkills, name, "SKILL.md"), "utf8"),
    `skills/${name}/SKILL.md differs from plugins/zerobounce/skills/${name}/SKILL.md`,
  );
  assert.match(text, /^---\n/);
  assert.match(text, new RegExp(`^name:\\s*${name}$`, "m"));
  assert.match(text, /^description:\s*\S/m);
}

console.log("gemini-extension: ok");
