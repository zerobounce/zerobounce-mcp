---
name: validate-email
description: Validate one email address with ZeroBounce.
---

# Validate one email

1. Use the address the user gave. If they gave none, ask for it.
2. Call `validate` on the `zerobounce` MCP server.
3. Explain the status, sub-status, and whether it is safe to send. Mention a suggested correction when the result includes one.
