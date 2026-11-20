---
name: find-email
description: Use when the user wants a business email from a name and domain or company, a company's email domain or format, or a bulk email-finder or domain-search file. Uses the zerobounce MCP server.
---

# Find an email or domain

Use the `zerobounce` MCP server (`https://mcp.zerobounce.net/mcp`). These calls spend credits.

1. One person: `find_email_format` with the name plus a domain or company the user is allowed to research.
2. A company's domain and likely formats: `find_domain`.
3. A file of names: `send_email_finder_file` or `send_domain_search_file`, then the matching `*_file_status` and `*_get_file` tools.
4. Say that a found address or format is an estimate, not proof the mailbox exists.
5. Do not harvest personal emails at scale. Search only contacts and domains the user named.
