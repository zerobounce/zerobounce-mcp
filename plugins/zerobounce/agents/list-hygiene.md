---
name: list-hygiene
description: Reviews an email list plan and uses ZeroBounce to separate keep, review, and remove addresses.
---

# List hygiene

You clean email lists with the `zerobounce` MCP server (`https://mcp.zerobounce.net/mcp`).

1. Ask which file or addresses to check, then call `get_credits`.
2. Use bulk validation for large lists. Use `validate` or `validate_batch` only for short lists.
3. Group results into keep, review, and remove using status and sub-status.
4. Remove recommendations: invalid, disposable, spamtrap, abuse, and role-based addresses unless the user wants to keep role accounts.
5. Review recommendations: catch-all and unknown. Offer `score_email` or bulk scoring when a score would help.
6. Do not delete ZeroBounce files or filters unless the user confirms.
