---
name: zerobounce
description: Use when the user asks to verify or validate emails, score list quality, check ZeroBounce credits or API usage, find business emails or domains, run List Evaluator, manage allow/block filters, bulk CSV or S3/SFTP jobs, inbox placement tests, or email Warmup — via the zerobounce MCP server (hosted OAuth or the self-hosted @zerobounce/mcp package from this repo).
---

# ZeroBounce MCP

## Hosted (this plugin's default)

`https://mcp.zerobounce.net/mcp` — Streamable HTTP, OAuth. No API key in config. First use opens ZeroBounce sign-in and consent (scopes, tools, API region).

References: [llms.txt](https://mcp.zerobounce.net/llms.txt), [server card](https://mcp.zerobounce.net/.well-known/mcp/server-card.json).

| Scope | Meaning |
| --- | --- |
| `mcp:read` | Credits, usage, bulk status/download, filters, List Evaluator, inbox placement reads |
| `mcp:credits` | Validate, score, activity, finders, credit-bearing inbox tests |
| `mcp:write` | Upload/delete bulk files, batch validate, S3/SFTP, filters, inbox placement changes |
| `mcp:warmup` | Warmup tools when the team has a Warmup key |

Only approved tools are visible. Reconnect to change permissions or pick up new tools after a server update.

## Self-hosted (`@zerobounce/mcp` from this repo)

Stdio + `ZEROBOUNCE_API_KEY` (optional `ZEROBOUNCE_WARMUP_API_KEY`). See `server.json`, `README.md`, and `docs/configuration-cursor.md`. Tool **names** match hosted; tool **arguments** here use camelCase (`fileId`, `ipAddress`, …).

## Usage rules

1. Call `get_credits` before large credit-spending work.
2. Process only addresses and domains the user provided or may legally process.
3. Confirm before destructive tools (`delete_*`, `delete_filter`, and similar).
4. Prefer bulk file tools over hundreds of single `validate` calls.
5. Per connection on hosted: 300 requests/min and 60 credit tool calls/min.
6. Hosted S3/SFTP tools require production `mcp.zerobounce.net`.

## Sandbox addresses (no credits)

`valid@example.com`, `invalid@example.com`, `disposable@example.com`, `catch_all@example.com` — predictable statuses for demos.

## Not supported

Buying credits, sending campaigns, or mass harvesting of personal emails.