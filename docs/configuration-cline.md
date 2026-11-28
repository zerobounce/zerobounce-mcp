# Configuration Guide: Cline

Setup for the ZeroBounce MCP server in Cline (the IDE extension and the CLI).

The default is the hosted remote server. It needs no install and no API key: you sign in to
ZeroBounce in the browser. Use **Run it locally** only when you were asked to run the server on
your own machine.

## Hosted server

**URL:** `https://mcp.zerobounce.net/mcp`

Nothing to install or build. Leave the API key and any `Authorization` header out of the config.
Cline does not open the browser by itself: you start sign-in (see **Sign in** below). On the
ZeroBounce page, sign in, choose which permissions and tools to grant (spending credits, changing
account data, Warmup), and pick the API region. A `401` before that sign-in is the sign-in
prompt.

### Where the settings file is

The file is `cline_mcp_settings.json`. Keep any servers already in it.

- **Current Cline:** `~/.cline/data/settings/cline_mcp_settings.json`. The IDE extension, the
  CLI and the SDK all read this one file. `CLINE_MCP_SETTINGS_PATH` overrides that path.
- **Older VS Code extension versions:** VS Code's storage instead:
  - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
  - Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
  - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- **To open the right one in the IDE:** Cline panel → MCP Servers icon → **Configure** tab →
  **Configure MCP Servers**.
- **Remote Servers tab,** instead of editing JSON: server name `zerobounce`, URL
  `https://mcp.zerobounce.net/mcp`, transport **Streamable HTTP**.

### Configuration

`"type": "streamableHttp"` is required. Without it Cline uses the legacy SSE transport, which
this server does not serve. Leave `autoApprove` empty so credit-spending and delete tools stay
behind a confirmation.

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

Save the file, or click **Add Server** on the Remote Servers tab. Cline connects right away.

### Sign in

- **IDE:** Cline panel → MCP Servers → **Configure**. The `zerobounce` row says "This MCP server
  requires authentication to get started." Click **Authenticate** and finish the ZeroBounce page
  in the browser. The row then shows the server as connected, with its tools.
- **CLI:** run `cline mcp`, choose **Authorize OAuth**, and pick `zerobounce`. Adding the server
  from the wizard instead (`cline mcp` → Add server, Streamable HTTP, auth **OAuth**, client ID
  left empty for dynamic registration) opens the browser as soon as the server is saved.

## Run it locally

Use this when you want `@zerobounce/mcp` on your machine instead of the hosted server.

1. Check that Node.js 22 or later is installed: `node --version`.
2. Create an API key in the API section of the [ZeroBounce dashboard](https://www.zerobounce.net).
   Put it only in the settings file below.
3. Add this entry to `cline_mcp_settings.json`, keeping any servers already in it:

```json
{
  "mcpServers": {
    "zerobounce": {
      "command": "npx",
      "args": ["-y", "@zerobounce/mcp"],
      "env": {
        "ZEROBOUNCE_API_KEY": "YOUR_API_KEY"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

The 25 Warmup tools need a separate Warmup API key. If you have one, add
`"ZEROBOUNCE_WARMUP_API_KEY": "YOUR_WARMUP_API_KEY"` to `env`. Without it those tools are not
listed.

Users in the US or EU can add `"ZEROBOUNCE_API_URL": "us"` or `"eu"` to `env` to use a regional
API host for single-address calls.

## Check that it works

After sign-in (hosted) or after the local server starts, ask Cline, in order:

1. `How many ZeroBounce credits do I have left?` — calls `get_credits`. Does not spend credits.
2. `Validate valid@example.com` — sandbox address. Does not spend credits. The other sandbox
   addresses are `invalid@example.com`, `disposable@example.com`, and `catch_all@example.com`.

Finding an email, checking activity, scoring, and bulk jobs spend credits. Use them only for
addresses, names, and domains you meant to check, and confirm before delete tools.

Cline can also offer the server's prompts: `check_email_before_sending`, `clean_email_list`,
`find_work_email`, and `inbox_placement_test`. `find_work_email` spends credits, and
`inbox_placement_test` uses one of your inbox placement tests.

## Troubleshooting

### Cline tries SSE and never connects

**Problem:** The server does not connect, or Cline reports an SSE error.

**Solutions:**

- Set `"type": "streamableHttp"` on the hosted entry. Omitting `type` selects legacy SSE.
- On the Remote Servers tab, choose **Streamable HTTP**, not **SSE (Legacy)**.
- The URL is `https://mcp.zerobounce.net/mcp`, including `/mcp`.

### "This MCP server requires authentication to get started."

**Problem:** The `zerobounce` row shows this message and no tools, or a call returns `401`.

**Solutions:**

- On the hosted server that is the sign-in prompt, not a failure. Click **Authenticate** on the
  row (IDE), or run `cline mcp` and choose **Authorize OAuth** (CLI), then finish the ZeroBounce
  page in the browser.
- Use the same button or wizard action to sign in again, for example to grant more tools.

### "ZeroBounce API key is required" (local server)

**Problem:** The local `npx` server lists its tools, but every call answers that the API key is
required.

**Solutions:**

- The key did not reach the server. Check `ZEROBOUNCE_API_KEY` under `env` in the settings file,
  then save it again so Cline restarts the server.

### Tools that spend credits or delete data

Leave `autoApprove` as `[]`. Tools that spend credits or change the account say so in their
descriptions, and deletes are marked destructive. Confirm those calls in the chat.

## More detail

- [README.md](../README.md) — hosted sign-in, tools, and the local server
- [llms-install.md](../llms-install.md) — the same steps, written for an agent installing the server
- https://mcp.zerobounce.net/llms.txt
