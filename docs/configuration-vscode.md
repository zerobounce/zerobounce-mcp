# Configuration Guide: Visual Studio Code

Complete setup guide for using ZeroBounce MCP server in Visual Studio Code.

## Prerequisites

Before configuring VS Code, make sure you've completed the **Quick Start** steps in `README.md`:

- Installed Node.js and the ZeroBounce MCP server
- Obtained a ZeroBounce API key (see **Getting Your API Key** in `README.md`)
- Verified your environment with `node --version` and `npm --version`

This guide assumes you already have VS Code installed; for MCP extension installation, see below.

## Installing the MCP Extension

If you haven't installed the MCP extension yet:

1. Open VS Code
2. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
3. Search for "Model Context Protocol" or "MCP"
4. Click "Install" on the official MCP extension

## Installation Steps

### 1. Install the MCP server

```bash
npm install git+https://github.com/zerobounce/zerobounce-mcp.git
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

6. **Save the configuration**
   - The MCP server should now be available in VS Code

## Verifying Installation

After installation, verify the server is running:

1. **Open the Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. **Type and select** "MCP: List Available Tools"
3. **Look for** ZeroBounce tools in the list
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

### Via Command Palette

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type "MCP: Execute Tool"
3. Select the ZeroBounce tool you want to use
4. Provide the required parameters

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

#### MCP Extension Not Found

**Problem:** Cannot find the MCP extension

**Solutions:**
- Search for "Model Context Protocol" in the Extensions marketplace
- Ensure you're using an up-to-date version of VS Code
- Check that extensions are not blocked by your organization's policy

#### Server Not Appearing

**Problem:** ZeroBounce tools don't show up

**Solutions:**
- Verify Node.js is installed: run `node --version` in integrated terminal
- Check MCP extension is enabled (Extensions → MCP → Enabled)
- Restart VS Code completely
- View MCP logs via Command Palette → "MCP: Show Logs"

#### Invalid API Key

**Problem:** Error about invalid API key

**Solutions:**
- Double-check your API key at [ZeroBounce Dashboard](https://www.zerobounce.net)
- Ensure no extra spaces or characters in the configuration
- Verify the API key hasn't expired
- Try regenerating your API key

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
2. Type "MCP: Show Logs"
3. Select the zerobounce server
4. Review the log output for errors

### Still Having Issues?

- Review the [main documentation](../README.md)
- Check [GitHub Issues](https://github.com/zerobounce/zerobounce-mcp/issues)
- View [VS Code's MCP documentation](https://code.visualstudio.com/docs/editor/mcp)
- Open a new issue with:
  - VS Code version (Help → About)
  - MCP extension version
  - Node.js version (`node --version`)
  - Operating system
  - Complete error message
  - Configuration (without API key)