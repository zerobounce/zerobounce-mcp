---
name: validate-emails
description: Use when the user wants to verify or validate one email address or a short list, interpret ZeroBounce status and sub-status, or check sandbox addresses. Uses the zerobounce MCP server.
---

# Validate emails

The `zerobounce` MCP server is `https://mcp.zerobounce.net/mcp` (HTTP, OAuth). Sign in on first use.

1. For more than a handful of addresses, call `get_credits` first.
2. One address: `validate` (alias `validate_email`). Up to 100: `validate_batch` (needs write and credits permission).
3. Explain status and sub-status in plain language. Flag disposable, role-based, catch-all, spamtrap, abuse, and invalid addresses.
4. Confirm before any call that spends credits on addresses the user did not supply.
5. Sandbox addresses spend no credits: `valid@example.com`, `invalid@example.com`, `disposable@example.com`, `catch_all@example.com`.
