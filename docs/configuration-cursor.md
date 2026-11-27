# Configuration Guide: Cursor IDE

Setup for the ZeroBounce MCP server in Cursor.

The default is the hosted remote server at `https://mcp.zerobounce.net/mcp`. Nothing to install
and no API key: Cursor opens ZeroBounce in the browser so you can sign in. Use **Run it locally**
only when you want `@zerobounce/mcp` on your own machine.

## Hosted server

**URL:** `https://mcp.zerobounce.net/mcp`

On the first connection Cursor opens your browser at ZeroBounce. Sign in, choose which
permissions and tools to grant (spending credits, changing account data, Warmup), and pick the
API region. A `401` before that sign-in is the sign-in prompt. Leave the API key and any
`Authorization` header out of the config.

### Plugin

Import this repo as a marketplace (**Customize → Add Marketplace**,
`https://github.com/zerobounce/zerobounce-mcp`), then install **ZeroBounce**. The plugin
connects with `"type": "http"` and adds skills, rules, agents, and commands. See
[CURSOR_MARKETPLACE.md](CURSOR_MARKETPLACE.md).

### Manual config

Edit `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (one project). Cursor also
manages MCP servers from **Customize** in the sidebar. Menu names change between versions; see
[Cursor's MCP documentation](https://cursor.com/docs/context/mcp) if yours differ.

```json
{
  "mcpServers": {
    "zerobounce": {
      "url": "https://mcp.zerobounce.net/mcp"
    }
  }
}
```

Keep any servers already in the file. Restart Cursor if the server does not appear.

## Check that it works

1. Open the Composer (⌘/Ctrl + I).
2. Ask `How many ZeroBounce credits do I have left?` — calls `get_credits`. Does not spend credits.
3. Ask `Validate valid@example.com`. That sandbox address does not spend a credit. The other
   sandbox addresses are `invalid@example.com`, `disposable@example.com`, and
   `catch_all@example.com`.

Finding an email, checking activity, scoring, and bulk jobs spend credits. Use them only for
addresses, names, and domains you meant to check.

### Example workflows

**1. Validate emails in a file:**
```
I have a list of emails in data.csv. Can you read them and validate each one?
```

**2. Build an email validation feature:**
```
Create a function that validates an email using ZeroBounce and returns the result
```

**3. Check account status:**
```
Show me my ZeroBounce account credits and recent usage
```

## Run it locally

Use this only when you want the server on your machine instead of `https://mcp.zerobounce.net/mcp`.

The server requires Node.js 22 or later (`node --version`).

```bash
npm install -g @zerobounce/mcp
```

```json
{
  "mcpServers": {
    "zerobounce": {
      "command": "zerobounce-mcp",
      "args": ["--api-key=YOUR_API_KEY"]
    }
  }
}
```

Replace `YOUR_API_KEY` with a key from the [ZeroBounce dashboard](https://www.zerobounce.net).
See **Getting your API key** in `README.md`. Restart Cursor after saving.

To run your own HTTP deployment instead, see **Remote (HTTP) Mode** in `README.md`. That mode
sends the key on each request in `X-ZeroBounce-Api-Key`. It is separate from the hosted server
above.

## Troubleshooting

### Server not appearing

**Problem:** ZeroBounce tools don't show up in Cursor.

**Solutions:**

- Confirm `~/.cursor/mcp.json` or `.cursor/mcp.json` contains the hosted URL, with no API key.
- Restart Cursor completely (quit and reopen).
- Check the MCP configuration under **Customize** in the sidebar.
- For a local install only: Node.js 22 or later is installed (`node --version`).

### 401 before you have signed in

**Problem:** The first tool call to `https://mcp.zerobounce.net/mcp` returns `401`.

**Solutions:**

- That is the sign-in prompt. Finish the ZeroBounce page in the browser.
- Do not add an API key or `Authorization` header to the hosted entry.
- `405 Method Not Allowed` when you open the URL in a browser is expected; MCP clients use `POST`.
- The URL ends in `/mcp`.

### Invalid API key (local install)

**Problem:** A local `zerobounce-mcp` process reports an invalid API key.

**Solutions:**

- Verify the key at the [ZeroBounce dashboard](https://www.zerobounce.net).
- Remove extra spaces from the configuration.
- Regenerate the key in the dashboard if it no longer works.

### Connection errors

**Problem:** Cannot connect to ZeroBounce.

**Solutions:**

- Check your internet connection.
- Verify no firewall is blocking `mcp.zerobounce.net` (hosted) or `api.zerobounce.net` (local).
- Check whether a proxy is interfering, and try another network.

### Viewing logs

1. Open **Customize** in the sidebar.
2. Select the zerobounce server.
3. Open its logs (or the "MCP Logs" output channel).

### Still having issues?

- Check the [main documentation](../README.md)
- Search [GitHub Issues](https://github.com/zerobounce/zerobounce-mcp/issues)
- Open a new issue with your Cursor version, operating system, the error message, and your
  configuration with any API key removed
