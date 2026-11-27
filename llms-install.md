# Installing the ZeroBounce MCP server (for AI agents)

These steps are for an agent such as Cline setting up ZeroBounce for a user. There are two ways
to connect. Use the hosted server unless the user asks to run it locally or their client cannot
connect to remote servers.

## Option 1: hosted server (recommended, no API key)

Nothing to install or build. Leave the API key and any `Authorization` header out of the config.
On the first connection the client opens the user's browser at ZeroBounce: the user signs in,
chooses which permissions and tools to grant (spending credits, changing account data, Warmup)
and picks the API region. Tell the user to expect this page and finish it in the browser. A
`401` before that sign-in is the sign-in prompt.

### Cline

Add this entry to `cline_mcp_settings.json`, keeping any servers already in it.

- IDE: Cline panel → MCP Servers → **Configure** → **Configure MCP Servers**.
- CLI: `~/.cline/data/settings/cline_mcp_settings.json`. `CLINE_MCP_SETTINGS_PATH` overrides that path.
- Remote Servers tab, instead of editing JSON: name `zerobounce`, URL
  `https://mcp.zerobounce.net/mcp`, transport **Streamable HTTP**.

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

`"type": "streamableHttp"` is required. Without it Cline uses the legacy SSE transport, which
this server does not offer. Leave `autoApprove` empty so credit-spending and delete tools stay
behind a confirmation.

### Cursor

Prefer the plugin: Customize → Add Marketplace → import
`https://github.com/zerobounce/zerobounce-mcp`, then install **ZeroBounce**. The plugin sets
`"type": "http"` and adds skills, rules, agents, and commands. See
[docs/CURSOR_MARKETPLACE.md](docs/CURSOR_MARKETPLACE.md).

Manual config, in `~/.cursor/mcp.json` or `.cursor/mcp.json` in a project:

```json
{
  "mcpServers": {
    "zerobounce": {
      "url": "https://mcp.zerobounce.net/mcp"
    }
  }
}
```

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

After the user finishes sign-in, send these prompts in order:

1. `How many ZeroBounce credits do I have left?` — calls `get_credits`. Does not spend credits.
2. `Validate valid@example.com` — sandbox address. Does not spend credits. The other sandbox
   addresses are `invalid@example.com`, `disposable@example.com`, and `catch_all@example.com`.

Finding an email, checking activity, scoring, and bulk jobs spend credits. Use them only for
addresses, names, and domains the user provided, and confirm before delete tools. The ready-made
MCP prompts are `check_email_before_sending`, `clean_email_list`, `find_work_email`, and
`inbox_placement_test`. `find_work_email` and `inbox_placement_test` spend credits; say so before
running them.

More detail: [README.md](README.md), [docs/configuration-cline.md](docs/configuration-cline.md), and https://mcp.zerobounce.net/llms.txt.
