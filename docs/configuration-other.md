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
