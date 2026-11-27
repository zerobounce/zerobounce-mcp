# Installing the ZeroBounce MCP server (for AI agents)

These steps are for an agent such as Cline setting up ZeroBounce for a user. There are two ways
to connect. Use the hosted server unless the user asks to run it locally or their client cannot
connect to remote servers.

## Option 1: hosted server (recommended, no API key)

Nothing to install or build. Add this entry to the MCP settings file (for Cline,
`cline_mcp_settings.json`), keeping any servers already in it:

```json
{
  "mcpServers": {
    "zerobounce": {
      "type": "streamableHttp",
      "url": "https://mcp.zerobounce.net/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

- `"type": "streamableHttp"` is required. Without it Cline uses the legacy SSE transport, which
  this server does not offer.
- Do not add an `Authorization` header or an API key. On the first connection the client opens
  the user's browser at ZeroBounce: the user signs in, chooses which permissions and tools to
  grant (spending credits, changing account data, Warmup) and picks the API region. Tell the user
  to expect this page and finish it in the browser.
- The server answers `401` until the user has signed in. That is the sign-in prompt, not an error.

## Option 2: run it locally (needs an API key)

1. Check that Node.js 22 or later is installed: `node --version`.
2. Ask the user for their ZeroBounce API key. They can create one in the API section of their
   ZeroBounce dashboard at https://www.zerobounce.net. Never invent a key, and never
   write it anywhere except the MCP settings file.
3. Add this entry to the MCP settings file, keeping any servers already in it:

   ```json
   {
     "mcpServers": {
       "zerobounce": {
         "command": "npx",
         "args": ["-y", "@zerobounce/mcp"],
         "env": {
           "ZEROBOUNCE_API_KEY": "THE_USER_API_KEY"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

4. Optional: the 25 Warmup tools need a separate Warmup API key (Warmup is a separate product
   with its own key). If the user has one, add `"ZEROBOUNCE_WARMUP_API_KEY": "THE_USER_WARMUP_KEY"`
   to `env`. Without it the Warmup tools are simply not listed.

Users in the US or EU can add `"ZEROBOUNCE_API_URL": "us"` or `"eu"` to `env` to use a regional
API host for single-address calls.

## Check that it works

Ask the server for the credit balance with the `get_credits` tool. To test validation without
spending credits, validate a sandbox address such as `valid@example.com`.

Tools that spend credits or change the account say so in their descriptions, and deletes are
marked destructive: confirm with the user before calling those. Do not add them to
`autoApprove`.

More detail: [README.md](README.md) and https://mcp.zerobounce.net/llms.txt.
