# ZeroBounce

Context for the ZeroBounce Gemini CLI extension (`gemini-extension.json`). Working on this
repository's code instead? See `AGENTS.md`.

The `zerobounce` MCP server (`https://mcp.zerobounce.net/mcp`) acts on the user's own ZeroBounce
account. The first call opens ZeroBounce in the browser to sign in (OAuth). The user picks the
permissions and tools there, so only the tools they approved are listed. Never ask for an API key.

When the user works with email addresses, lists, or ZeroBounce:

- Use the `zerobounce` tools. Do not invent ZeroBounce API calls or call the API directly.
- Tools whose description says `CREDITS: Each successful call spends` use credits. Call them only
  for addresses, names and domains the user gave and asked about. Call `get_credits` before a
  large run.
- Confirm before delete and other destructive tools, and before spending credits on data the user
  did not provide.
- More than about 100 addresses: use the bulk file tools (`send_file`, then `file_status` and
  `get_file`) instead of many single `validate` calls.
- Explain `status` and `sub_status` in plain language. Found emails, formats and AI scores are
  estimates, not proof that a mailbox exists.
- Sandbox addresses spend no credits: `valid@example.com`, `invalid@example.com`,
  `disposable@example.com`, `catch_all@example.com`.
- Email lists and results are customer data. Do not commit them, paste whole files into logs, or
  put API keys in files or chat.

The skills in `skills/` cover validating addresses, cleaning a list, finding an email or domain,
and inbox placement and Warmup in more detail.
