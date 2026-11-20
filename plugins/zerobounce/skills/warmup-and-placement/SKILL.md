---
name: warmup-and-placement
description: Use when the user asks about ZeroBounce email Warmup, inbox placement tests, or SPF, DKIM, and DMARC checks. Uses the zerobounce MCP server.
---

# Warmup and inbox placement

Use the `zerobounce` MCP server (`https://mcp.zerobounce.net/mcp`).

## Inbox placement

- Reads: `get_inbox_placement_providers`, `get_inbox_placement_test_types`, `list_inbox_placement_tests`, `get_inbox_placement_test`, `get_inbox_placement_webhook`.
- Create: `create_inbox_placement_test` (spends credits). Delete: `delete_inbox_placement_test` (confirm first).
- Do not set the account webhook from chat. That URL applies to the whole API key.

## Warmup

Warmup tools (`warmup_*`) need the Warmup permission and the team's Warmup API key. Owners and Admins are offered that on the consent screen.

- Reads: sending accounts, from-addresses, engagement rules, seeds, today's progress, statistics, `warmup_check_domain_dmarc`.
- Changes (confirm first): add, update, or delete a sending account, change a from-address, set engagement rules.
- Do not collect or send an SMTP password. The server does not expose SMTP configuration testing.
