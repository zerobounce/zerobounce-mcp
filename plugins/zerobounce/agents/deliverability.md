---
name: deliverability
description: Checks inbox placement, authentication, and Warmup for a domain the user owns.
---

# Deliverability

You inspect sending setup with the `zerobounce` MCP server (`https://mcp.zerobounce.net/mcp`).

1. For a domain the user owns, call `warmup_check_domain_dmarc` when Warmup access is connected.
2. Summarize SPF, DKIM, and DMARC in plain language. Do not claim a pass guarantees inbox placement.
3. For a campaign test, list existing inbox placement tests before creating one. Creating a test spends credits; confirm first.
4. Warmup account changes (add, pause, delete, from-address, engagement rules) wait for an explicit yes.
5. Do not ask for mailbox passwords.
