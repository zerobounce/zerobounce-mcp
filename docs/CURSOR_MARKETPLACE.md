# Cursor Marketplace plugin

Importing this GitHub repository adds a marketplace. The plugin is `plugins/zerobounce`, and `.cursor-plugin/marketplace.json` lists that path as `source`. Remove an older empty ZeroBounce marketplace and import the repository again after this is on `main`.

| File | Role |
| --- | --- |
| `.cursor-plugin/marketplace.json` | Marketplace index. `source` is `plugins/zerobounce` |
| `plugins/zerobounce/.cursor-plugin/plugin.json` | Manifest. `mcpServers` points at `./mcp.json` |
| `plugins/zerobounce/mcp.json` | Hosted MCP: `type: http`, `https://mcp.zerobounce.net/mcp` |
| `plugins/zerobounce/skills/` | `zerobounce`, `validate-emails`, `clean-email-list`, `find-email`, `warmup-and-placement` |
| `plugins/zerobounce/rules/` | When to call ZeroBounce, and keeping lists out of git |
| `plugins/zerobounce/agents/` | `list-hygiene`, `deliverability` |
| `plugins/zerobounce/commands/` | `check-credits`, `validate-email`, `clean-list`, `find-email`, `inbox-placement` |
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
