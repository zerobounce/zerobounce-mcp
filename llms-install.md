# Installing the ZeroBounce MCP server (for AI agents)

Set up the hosted remote server at `https://mcp.zerobounce.net/mcp`. That is the default.
Do not install a package, do not ask for an API key, and do not add an `Authorization` header.

Use the local `npx` setup only when the user explicitly asks to run the server on their machine,
or when their client cannot connect to a remote MCP server. If they did not say that, stay on
the hosted server.

Sign-in happens in the user's browser at ZeroBounce. The user signs in, chooses which
permissions and tools to grant (spending credits, changing account data, Warmup), and picks the
API region. Most clients open that page on the first connection; Cline waits for the user to
click **Authenticate** (see below). A `401` before that sign-in is the sign-in prompt, not an
error.

Keep any servers already in the settings file.

## Cline

Add this entry to `cline_mcp_settings.json`.

- Current Cline (IDE extension and CLI share it): `~/.cline/data/settings/cline_mcp_settings.json`.
  `CLINE_MCP_SETTINGS_PATH` overrides that path.
- Older versions of the VS Code extension: VS Code's storage, under
  `Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
  (macOS `~/Library/Application Support/`, Windows `%APPDATA%\`, Linux `~/.config/`).
- If unsure, use the first path if it exists. In the IDE, Cline panel → MCP Servers →
  **Configure** → **Configure MCP Servers** opens the file that version reads.
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

Cline connects as soon as the file is saved, and does not open the browser by itself. After
saving, tell the user to finish sign-in:

- IDE: Cline panel → MCP Servers → **Configure**. The `zerobounce` row says "This MCP server
  requires authentication to get started." Click **Authenticate**, then complete the ZeroBounce
  page in the browser.
- CLI: run `cline mcp`, choose **Authorize OAuth**, and pick `zerobounce`. (Adding the server
  with `cline mcp` → Add server, Streamable HTTP, auth **OAuth**, client ID left empty, opens the
  browser right away.)

Wait until the user says sign-in is done before running the checks below.

## Cursor

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

## VS Code

`.vscode/mcp.json`, or the user `mcp.json`. The top-level key is `servers`.

```json
{
  "servers": {
    "zerobounce": {
      "type": "http",
      "url": "https://mcp.zerobounce.net/mcp"
    }
  }
}
```

## Claude and other clients

- Claude (claude.ai and the desktop app): Settings → Connectors → Add custom connector, URL
  `https://mcp.zerobounce.net/mcp`.
- Claude Code: `claude mcp add --transport http zerobounce https://mcp.zerobounce.net/mcp`
- Any other client that accepts a remote URL: `https://mcp.zerobounce.net/mcp`, with no API key.
- A client that can only launch a local command still uses the hosted server, through
  `npx -y mcp-remote https://mcp.zerobounce.net/mcp`, with no API key. The browser sign-in is the
  same.

Client details: [docs/configuration-cline.md](docs/configuration-cline.md),
[docs/configuration-cursor.md](docs/configuration-cursor.md),
[docs/configuration-vscode.md](docs/configuration-vscode.md),
[docs/configuration-other.md](docs/configuration-other.md).

## Local server, only when the user asked for it

Skip this section unless the user asked to run ZeroBounce locally, or their client cannot reach
the hosted URL.

1. Check that Node.js 22 or later is installed: `node --version`.
2. Ask the user for their ZeroBounce API key. They can create one in the API section of their
   ZeroBounce dashboard at https://www.zerobounce.net. Never invent a key, and never write it
   anywhere except the MCP settings file.
3. Add this entry, keeping any servers already in the file:

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

4. Optional: the 25 Warmup tools need a separate Warmup API key. If the user has one, add
   `"ZEROBOUNCE_WARMUP_API_KEY": "THE_USER_WARMUP_KEY"` to `env`. Without it the Warmup tools are
   not listed.

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
`inbox_placement_test`. `find_work_email` spends credits and `inbox_placement_test` uses one of
the account's inbox placement tests; say so before running them.

More detail: [README.md](README.md) and https://mcp.zerobounce.net/llms.txt.
