# Configuration Guide: Other MCP Clients

Setup for the ZeroBounce MCP server in clients other than Cursor, VS Code, and Cline.

The default is the hosted remote server at `https://mcp.zerobounce.net/mcp`. Nothing to install
and no API key: the client opens ZeroBounce in the browser so you can sign in. Use **Run it
locally** only when you want `@zerobounce/mcp` on your own machine, or when the client cannot
connect to a remote MCP server.

## Hosted server

**URL:** `https://mcp.zerobounce.net/mcp`

On the first connection the client opens your browser at ZeroBounce. Sign in, choose which
permissions and tools to grant (spending credits, changing account data, Warmup), and pick the
API region. A `401` before that sign-in is the sign-in prompt. Leave the API key and any
`Authorization` header out of the config.

A typical remote entry:

```json
{
  "mcpServers": {
    "zerobounce": {
      "url": "https://mcp.zerobounce.net/mcp"
    }
  }
}
```

`405 Method Not Allowed` when you open that URL in a browser is expected; MCP clients use `POST`.

### Claude

claude.ai and the Claude desktop app: Settings → Connectors → **Add custom connector**, with the
URL `https://mcp.zerobounce.net/mcp`.

Claude Code:

```bash
claude mcp add --transport http zerobounce https://mcp.zerobounce.net/mcp
```

### ChatGPT

Add a custom connector (app) with the URL `https://mcp.zerobounce.net/mcp` and OAuth
authentication, where your plan allows custom connectors.

### Clients that only launch a local command

Point [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) at the hosted URL. Do not put an
API key in the arguments. The first connection still opens the browser to sign in.

```json
{
  "mcpServers": {
    "zerobounce": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.zerobounce.net/mcp"]
    }
  }
}
```

This is the fallback for a client that cannot store a remote URL. It is still the hosted server.

## Check that it works

1. Ask `How many ZeroBounce credits do I have left?` — calls `get_credits`. Does not spend credits.
2. Ask `Validate valid@example.com`. That sandbox address does not spend a credit. Other addresses do.

## Run it locally

Use this only when you were asked to run the server on your machine, or the client cannot reach
`https://mcp.zerobounce.net/mcp` even through `mcp-remote`.

The server requires Node.js 22 or later (`node --version`). Create a key in the API section of
the [ZeroBounce dashboard](https://www.zerobounce.net). See **Getting your API key** in
`README.md`.

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

The key can also be an environment variable. `--api-key` wins if both are set.

```json
{
  "mcpServers": {
    "zerobounce": {
      "command": "zerobounce-mcp",
      "env": { "ZEROBOUNCE_API_KEY": "YOUR_API_KEY" }
    }
  }
}
```

A reference such as `"${ZEROBOUNCE_API_KEY}"` works only when that variable is already in the
**client process** environment. Desktop apps launched from a Dock icon, Spotlight, or a
Start-menu shortcut do not read `~/.zshrc` or `~/.bashrc`. When the reference is not expanded,
some clients send the literal text `${ZEROBOUNCE_API_KEY}` as the key: the server starts, and
every call then fails with `api_key is invalid`. On macOS, publish the variable and restart the
client:

```bash
zsh -ic 'launchctl setenv ZEROBOUNCE_API_KEY "$ZEROBOUNCE_API_KEY"'
```

`launchctl setenv` is cleared on reboot. Writing the key in the config file avoids that.

To run your own HTTP deployment instead, see **Remote (HTTP) Mode** in `README.md`. That mode
sends the key on each request. It is separate from `https://mcp.zerobounce.net/mcp`.

### Claude Desktop (local)

**Configuration file:**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Use the hosted connector above unless you were asked for a local process. A local entry:

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

### Continue (local)

**Configuration file:** a YAML file in `.continue/mcpServers/` (for example
`.continue/mcpServers/zerobounce.yaml`), or an `mcpServers:` block in Continue's `config.yaml`.
Continue's MCP tools work in agent mode only.

```yaml
name: ZeroBounce
version: 0.0.1
schema: v1
mcpServers:
  - name: zerobounce
    command: zerobounce-mcp
    args:
      - "--api-key=YOUR_API_KEY"
```

If Continue can store a remote URL, use `https://mcp.zerobounce.net/mcp` with no API key instead
of this command.

### Zed (local)

**Configuration file:**

- macOS/Linux: `~/.config/zed/settings.json`
- Windows: `%APPDATA%\Zed\settings.json`

Zed's top-level key is `context_servers`. Open the file with `zed: open settings file`, or add
the server under Settings, AI, MCP Servers. If Zed can store a remote URL, use
`https://mcp.zerobounce.net/mcp` with no API key. A local entry:

```json
{
  "context_servers": {
    "zerobounce": {
      "command": "zerobounce-mcp",
      "args": ["--api-key=YOUR_API_KEY"],
      "env": {}
    }
  }
}
```

### Configuration file locations

| Client | Configuration file |
| --- | --- |
| Cursor | `~/.cursor/mcp.json` (global), `.cursor/mcp.json` (project) |
| VS Code | `.vscode/mcp.json` (workspace) or the user `mcp.json` (top-level key `servers`) |
| Cline | `cline_mcp_settings.json` (see [configuration-cline.md](configuration-cline.md)) |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS), `%APPDATA%\Claude\claude_desktop_config.json` (Windows) |
| Continue | `.continue/mcpServers/*.yaml` or `config.yaml` |
| Zed | `~/.config/zed/settings.json` (macOS/Linux) |

Paths and formats change between client versions. Check the client's own documentation.
