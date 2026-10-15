# Configuration Guide: Other MCP Clients

Complete setup guide for using ZeroBounce MCP server with any MCP-compatible client.

## Supported Clients

This guide covers configuration for:

- **Claude Desktop** - Anthropic's desktop app
- **Continue** - VS Code extension
- **Zed** - Modern code editor
- **Any MCP-compatible client** - Following the MCP specification

## Prerequisites

Before configuring any other MCP client, make sure you've completed the **Quick Start** steps in `README.md`:

- Installed Node.js and the ZeroBounce MCP server
- Obtained a ZeroBounce API key (see **Getting Your API Key** in `README.md`)
- Verified your environment with `node --version` and `npm --version`
- Installed your MCP-compatible client


## Generic Configuration

For any MCP client that follows the standard specification, you can start from the examples in **MCP Client Configuration** in `README.md`. A minimal configuration looks like:

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

> **⚠️ Important:** 
> - Replace `YOUR_API_KEY` with your actual ZeroBounce API key

The key can also be supplied as an environment variable instead of a flag. Clients that
spawn the server as a child process usually expose an `env` block for this:

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

`--api-key` wins if both are present.

### A note on `${ZEROBOUNCE_API_KEY}` references

Several clients support referencing a variable that already exists in their environment,
for example `"ZEROBOUNCE_API_KEY": "${ZEROBOUNCE_API_KEY}"`. This is only safe when the
variable is genuinely present in the **client process's** environment.

Desktop clients launched from a Dock icon, Spotlight, or a Start-menu shortcut do not
source `~/.zshrc`, `~/.bashrc`, or `~/.profile`, so exports in those files never reach
them. When the reference cannot be resolved, some clients forward the literal string
`${ZEROBOUNCE_API_KEY}` as the key. The server treats it as a valid non-empty key and
starts, so the client shows the server connected with all tools available — yet every
request fails with `api_key is invalid`.

On macOS, publish the variable to the GUI session and restart the client:

```bash
zsh -ic 'launchctl setenv ZEROBOUNCE_API_KEY "$ZEROBOUNCE_API_KEY"'
```

Run it through an interactive shell as shown, otherwise `$ZEROBOUNCE_API_KEY` may expand
to nothing and set an empty value. Verify with `launchctl getenv ZEROBOUNCE_API_KEY`.
This setting is cleared on reboot, so prefer a login LaunchAgent — or simply write the
key literally into the config file — if you need it to persist.


## Connecting to a Hosted Server

If ZeroBounce MCP is deployed as a remote server, clients that support Streamable HTTP with
custom headers can connect to its URL directly:

```json
{
  "mcpServers": {
    "zerobounce": {
      "url": "https://your-host.example.com/mcp",
      "headers": { "X-ZeroBounce-Api-Key": "YOUR_API_KEY" }
    }
  }
}
```

Replace `https://your-host.example.com/mcp` with the address of your deployment (see
**Remote (HTTP) Mode** in `README.md`). Nothing needs to be installed locally, and the API key
travels with every request in the `X-ZeroBounce-Api-Key` header. Clients that accept a bearer
token instead of arbitrary headers can send the key as `Authorization: Bearer YOUR_API_KEY`.

Clients that can only launch local commands can reach a hosted server through the
[`mcp-remote`](https://www.npmjs.com/package/mcp-remote) bridge:

```json
{
  "mcpServers": {
    "zerobounce": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-host.example.com/mcp",
        "--header",
        "X-ZeroBounce-Api-Key:${ZEROBOUNCE_API_KEY}"
      ],
      "env": { "ZEROBOUNCE_API_KEY": "YOUR_API_KEY" }
    }
  }
}
```

Keep the header value free of spaces (`Name:value`), because some clients split arguments on
whitespace; `mcp-remote` expands `${ZEROBOUNCE_API_KEY}` from the `env` block. This is also the
way to use a hosted server from **Claude Desktop**, whose configuration file only launches local
commands.

A `401` response means the key header did not arrive; a `405` when opening the URL in a browser
is expected, since MCP clients use `POST`.


## Client-Specific Examples

### Claude Desktop

**Configuration file location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
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

### Continue (VS Code Extension)

**Configuration file:** `.continue/config.json` in your workspace or home directory

**Configuration:**
```json
{
  "mcpServers": [
    {
      "name": "zerobounce",
      "command": "zerobounce-mcp",
      "args": ["--api-key=YOUR_API_KEY"]
    }
  ]
}
```

### Zed Editor

**Configuration file location:**
- macOS/Linux: `~/.config/zed/settings.json`
- Windows: `%APPDATA%\Zed\settings.json`

**Configuration:**
```json
{
  "mcp": {
    "servers": {
      "zerobounce": {
        "command": "zerobounce-mcp",
        "args": ["--api-key=YOUR_API_KEY"]
      }
    }
  }
}
```

### Configuration File Locations by Client

| Client | Configuration File Location |
|--------|----------------------------|
| **Cursor** | `~/.config/cursor/mcp.json` (macOS/Linux)<br>`%APPDATA%\Cursor\mcp.json` (Windows) |
| **VS Code** | User or workspace settings via MCP extension |
| **Claude Desktop** | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)<br>`%APPDATA%\Claude\claude_desktop_config.json` (Windows) |
| **Continue** | `.continue/config.json` |
| **Zed** | `~/.config/zed/settings.json` (macOS/Linux) |

> **Note:** Configuration file paths and formats may vary by client version. Always check your client's documentation for the most up-to-date information.
