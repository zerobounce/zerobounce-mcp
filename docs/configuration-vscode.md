# Configuration Guide: Visual Studio Code

Complete setup guide for using ZeroBounce MCP server in Visual Studio Code.

## Prerequisites

Before configuring VS Code, make sure you've completed the **Quick Start** steps in `README.md`:

- Installed Node.js 22 or later and the ZeroBounce MCP server
- Obtained a ZeroBounce API key (see **Getting Your API Key** in `README.md`)
- Verified your environment with `node --version` and `npm --version`

This guide assumes you already have a current VS Code installed. MCP support is built into VS Code
(used from Copilot Chat in agent mode); no extension is needed.

## Installation Steps

### 1. Install the MCP server

The server requires Node.js 22 or later; check with `node --version`.

```bash
npm install -g @zerobounce/mcp
```
### 2. Configure VS Code

1. **Open VS Code**
   - Launch Visual Studio Code

2. **Run the Command Palette**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)

3. **Select "MCP: Add Server"**
   - Type "MCP: Add Server" and select it from the list

4. **Choose workspace or user settings**
   - Select whether to add the server for the current workspace or globally for your user

5. **Copy the configuration**
   - You can copy and paste the configuration below:

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

VS Code's own `mcp.json` (workspace `.vscode/mcp.json`, or the user-profile file opened with
**MCP: Open User Configuration**) uses the top-level key `servers`, not `mcpServers`.

> **⚠️ Important:** 
> - Replace `YOUR_API_KEY` with your actual ZeroBounce API key

6. **Save the configuration**
   - The MCP server should now be available in VS Code

### Connecting to a hosted server

If ZeroBounce MCP is deployed as a remote server, add it as an HTTP server in `.vscode/mcp.json`
(or your user `mcp.json`). The `inputs` block makes VS Code prompt for the key once and store it
securely instead of keeping it in the file:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "zerobounce-api-key",
      "description": "ZeroBounce API key",
      "password": true
    }
  ],
  "servers": {
    "zerobounce": {
      "type": "http",
      "url": "https://your-host.example.com/mcp",
      "headers": { "X-ZeroBounce-Api-Key": "${input:zerobounce-api-key}" }
    }
  }
}
```

Replace `https://your-host.example.com/mcp` with the address of your deployment (see
**Remote (HTTP) Mode** in `README.md`). Nothing needs to be installed locally, and the API key
travels with every request in the `X-ZeroBounce-Api-Key` header.

## Verifying Installation

After installation, verify the server is running:

1. **Open the Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. **Type and select** "MCP: List Servers"
3. **Look for** the `zerobounce` server in the list and start it if it is stopped; its tools appear in Copilot Chat (agent mode) under the tools picker
4. **Try a test command**:
   ```
   How many ZeroBounce credits do I have?
   ```

If the tools don't appear, check the troubleshooting section below.

## Usage in VS Code

### With AI Assistant

If you're using VS Code with an AI assistant extension that supports MCP:

```
Validate the email "test@example.com"
Check if "user@domain.com" is valid
How many credits do I have?
```

### Choosing tools

In Copilot Chat, switch to agent mode and use the tools picker to enable or disable the ZeroBounce tools.

### Example Workflows

**1. Validate emails in workspace:**
```
Find all email addresses in this file and validate them using ZeroBounce
```

**2. Build validation logic:**
```
Create a TypeScript function that validates emails using ZeroBounce
```

**3. Monitor account:**
```
Show me my ZeroBounce account status and usage for this month
```

## Troubleshooting

### Common Issues

#### MCP Not Available

**Problem:** There is no MCP option in VS Code

**Solutions:**
- Update VS Code: MCP support is built in, not an extension
- Check that MCP is not disabled by your organization's policy

#### Server Not Appearing

**Problem:** ZeroBounce tools don't show up

**Solutions:**
- Verify Node.js 22 or later is installed: run `node --version` in integrated terminal
- Restart VS Code completely
- Run "MCP: List Servers", select zerobounce and choose the option that shows its output

#### Invalid API Key

**Problem:** Error about invalid API key

**Solutions:**
- Double-check your API key at [ZeroBounce Dashboard](https://www.zerobounce.net)
- Ensure no extra spaces or characters in the configuration
- Verify the API key hasn't expired
- Try regenerating your API key

#### Hosted Server Returns 401 or 405

**Problem:** Connecting to a hosted server fails with `401` or `405`

**Solutions:**
- `401` means the request reached the server without an API key: check that the
  `X-ZeroBounce-Api-Key` header is set and not empty
- `405 Method Not Allowed` when you open the URL in a browser is expected; MCP clients use `POST`
- Make sure the URL ends in `/mcp`

#### Connection Errors

**Problem:** Cannot connect to ZeroBounce API

**Solutions:**
- Check your internet connection
- Verify firewall allows `api.zerobounce.net`
- Check proxy settings in VS Code (File → Preferences → Settings → Proxy)
- Disable VPN temporarily to test

### Viewing Logs

To see detailed error messages:

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`
2. Run "MCP: List Servers" and select the zerobounce server
3. Choose the option that shows its output and review it for errors

### Still Having Issues?

- Review the [main documentation](../README.md)
- Check [GitHub Issues](https://github.com/zerobounce/zerobounce-mcp/issues)
- View [VS Code's MCP documentation](https://code.visualstudio.com/docs/agent-customization/mcp-servers)
- Open a new issue with:
  - VS Code version (Help → About)
  - Node.js version (`node --version`)
  - Operating system
  - Complete error message
  - Configuration (without API key)