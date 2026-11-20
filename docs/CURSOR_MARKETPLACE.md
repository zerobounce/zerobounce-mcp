# Cursor Marketplace plugin

Importing this GitHub repository adds a marketplace. Cursor only lists plugins that live under `plugins/` and are named in `.cursor-plugin/marketplace.json` (`pluginRoot` + `source`). A plugin at the repository root, or `"source": "."`, does not appear.

| File | Role |
| --- | --- |
| `.cursor-plugin/marketplace.json` | Marketplace index (`pluginRoot`: `plugins`) |
| `plugins/zerobounce/.cursor-plugin/plugin.json` | Plugin manifest |
| `plugins/zerobounce/mcp.json` | Hosted MCP: `https://mcp.zerobounce.net/mcp` (OAuth) |
| `plugins/zerobounce/skills/zerobounce/SKILL.md` | When and how to use ZeroBounce tools |
| `plugins/zerobounce/assets/logo.svg` | Plugin logo |

## Local check

```bash
node test/cursor-plugin.test.mjs
```

## Install

1. Customize → Add Marketplace → import `https://github.com/zerobounce/zerobounce-mcp`.
2. Open the ZeroBounce marketplace and install **ZeroBounce**.
3. If the list is empty, use Manage → Refresh after this layout is on `main`.
4. Connect the MCP server and complete ZeroBounce sign-in.

## Publish

Submit `https://github.com/zerobounce/zerobounce-mcp` at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish). Smoke: `get_credits`, then validate `valid@example.com`.

Self-hosted npm usage stays in `README.md` and `docs/configuration-cursor.md`. The plugin wires the hosted server.
