# Configuration Guide: Cline

Setup for the ZeroBounce MCP server in Cline (the IDE extension and the CLI).

The default is the hosted remote server. It needs no install and no API key: Cline opens
ZeroBounce in the browser so you can sign in. Use **Run it locally** only when you were asked to
run the server on your own machine.

## Hosted server

**URL:** `https://mcp.zerobounce.net/mcp`

Nothing to install or build. Leave the API key and any `Authorization` header out of the config.
On the first connection Cline opens your browser at ZeroBounce. Sign in, choose which permissions
and tools to grant (spending credits, changing account data, Warmup), and pick the API region.
A `401` before that sign-in is the sign-in prompt.

### Where the settings file is

The file is `cline_mcp_settings.json`. Keep any servers already in it.

- **IDE:** Cline panel → MCP Servers icon → **Configure** tab → **Configure MCP Servers**.
- **CLI:** `~/.cline/data/settings/cline_mcp_settings.json`. `CLINE_MCP_SETTINGS_PATH` overrides that path.
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

Save the file, or click **Add Server** on the Remote Servers tab. Cline connects on the next
message that needs the server.

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
`find_work_email`, and `inbox_placement_test`. `find_work_email` and `inbox_placement_test`
spend credits.

## Troubleshooting

### Cline tries SSE and never connects

**Problem:** The server does not connect, or Cline reports an SSE error.

**Solutions:**

- Set `"type": "streamableHttp"` on the hosted entry. Omitting `type` selects legacy SSE.
- On the Remote Servers tab, choose **Streamable HTTP**, not **SSE (Legacy)**.
- The URL is `https://mcp.zerobounce.net/mcp`, including `/mcp`.

### 401 before you have signed in

**Problem:** The first tool call returns `401`.

**Solutions:**

- On the hosted server that is the sign-in prompt. Finish the ZeroBounce page in the browser.
- To run the OAuth flow again, use Cline's MCP settings or, in the CLI, `cline mcp` and choose
  **Authorize OAuth**.
- A `401` on the local `npx` server means the API key is missing or was not passed through.
  Check `ZEROBOUNCE_API_KEY` in the settings file.

### Tools that spend credits or delete data

Leave `autoApprove` as `[]`. Tools that spend credits or change the account say so in their
descriptions, and deletes are marked destructive. Confirm those calls in the chat.

## More detail

- [README.md](../README.md) — hosted sign-in, tools, and the local server
- [llms-install.md](../llms-install.md) — the same steps, written for an agent installing the server
- https://mcp.zerobounce.net/llms.txt
