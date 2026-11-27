# Configuration Guide: Visual Studio Code

Setup for the ZeroBounce MCP server in Visual Studio Code.

The default is the hosted remote server at `https://mcp.zerobounce.net/mcp`. Nothing to install
and no API key: VS Code opens ZeroBounce in the browser so you can sign in. MCP support is built
into VS Code (Copilot Chat in agent mode). Use **Run it locally** only when you want
`@zerobounce/mcp` on your own machine.

## Hosted server

**URL:** `https://mcp.zerobounce.net/mcp`

On the first connection VS Code opens your browser at ZeroBounce. Sign in, choose which
permissions and tools to grant (spending credits, changing account data, Warmup), and pick the
API region. A `401` before that sign-in is the sign-in prompt. Leave the API key and any
`Authorization` header out of the config.

Add this to `.vscode/mcp.json` (this workspace) or the user `mcp.json` (**MCP: Open User
Configuration**). VS Code uses the top-level key `servers`, not `mcpServers`.

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

You can also run **MCP: Add Server** from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
and choose an HTTP server with that URL.

## Check that it works

1. Open the Command Palette and run **MCP: List Servers**.
2. Start `zerobounce` if it is stopped. Its tools appear in Copilot Chat (agent mode) under the
   tools picker.
3. Ask `How many ZeroBounce credits do I have left?` — calls `get_credits`. Does not spend credits.
4. Ask `Validate valid@example.com`. That sandbox address does not spend a credit. Other addresses do.

### Example workflows

**1. Validate emails in the workspace:**
```
Find all email addresses in this file and validate them using ZeroBounce
```

**2. Build validation logic:**
```
Create a TypeScript function that validates emails using ZeroBounce
```

**3. Monitor the account:**
```
Show me my ZeroBounce account status and usage for this month
```

## Run it locally

Use this only when you want the server on your machine instead of `https://mcp.zerobounce.net/mcp`.

The server requires Node.js 22 or later (`node --version`).

```bash
npm install -g @zerobounce/mcp
```

```json
{
  "servers": {
    "zerobounce": {
      "type": "stdio",
      "command": "zerobounce-mcp",
      "args": ["--api-key=YOUR_API_KEY"]
    }
  }
}
```

Replace `YOUR_API_KEY` with a key from the [ZeroBounce dashboard](https://www.zerobounce.net).
See **Getting your API key** in `README.md`.

To run your own HTTP deployment instead, see **Remote (HTTP) Mode** in `README.md`. That mode
sends the key on each request in `X-ZeroBounce-Api-Key`. It is separate from the hosted server
above.

## Troubleshooting

### MCP not available

**Problem:** There is no MCP option in VS Code.

**Solutions:**

- Update VS Code: MCP support is built in, not an extension.
- Check that MCP is not disabled by your organization's policy.

### Server not appearing

**Problem:** ZeroBounce tools don't show up.

**Solutions:**

- Confirm `.vscode/mcp.json` or the user `mcp.json` contains `"type": "http"` and
  `https://mcp.zerobounce.net/mcp`, with no API key.
- Restart VS Code completely.
- Run **MCP: List Servers**, select zerobounce, and open its output.
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

- Double-check the key at the [ZeroBounce dashboard](https://www.zerobounce.net).
- Remove extra spaces from the configuration.
- Regenerate the key in the dashboard if it no longer works.

### Connection errors

**Problem:** Cannot connect to ZeroBounce.

**Solutions:**

- Check your internet connection.
- Verify the firewall allows `mcp.zerobounce.net` (hosted) or `api.zerobounce.net` (local).
- Check proxy settings in VS Code (File → Preferences → Settings → Proxy).
- Disable a VPN temporarily to test.

### Viewing logs

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`.
2. Run **MCP: List Servers** and select the zerobounce server.
3. Open its output and review it for errors.

### Still having issues?

- Review the [main documentation](../README.md)
- Check [GitHub Issues](https://github.com/zerobounce/zerobounce-mcp/issues)
- View [VS Code's MCP documentation](https://code.visualstudio.com/docs/agent-customization/mcp-servers)
- Open a new issue with your VS Code version, operating system, the error message, and your
  configuration with any API key removed
