# Cursor Marketplace plugin

This repository includes a **single Cursor plugin** at the repo root (see [Cursor plugins reference](https://cursor.com/docs/reference/plugins)):

| File | Role |
| --- | --- |
| `.cursor-plugin/plugin.json` | Plugin manifest (`name`: `zerobounce`) |
| `mcp.json` | Hosted MCP: `https://mcp.zerobounce.net/mcp` (OAuth) |
| `skills/zerobounce/SKILL.md` | When and how to use ZeroBounce tools |
| `assets/logo.svg` | Marketplace logo |

There is no `.cursor-plugin/marketplace.json` — one plugin, one repo.

## Local check

```bash
node test/cursor-plugin.test.mjs
```

Install in Cursor: **Customize → Plugins → Import from GitHub** → `zerobounce/zerobounce-mcp`, or import this folder after clone. Complete OAuth on first MCP use.

## Publish

1. Merge to `main` on the public GitHub repo.
2. Submit `https://github.com/zerobounce/zerobounce-mcp` at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).
3. Smoke: connect MCP, `get_credits`, validate `valid@example.com`.

Self-hosted npm usage remains documented in `README.md` and `docs/configuration-cursor.md`; the published plugin wires the **hosted** server, matching the README's recommended Cursor path.