# Configuration Guide: Cursor IDE

Complete setup guide for using ZeroBounce MCP server in Cursor IDE.

## Prerequisites

Before configuring Cursor, make sure you've completed the **Quick Start** steps in `README.md`:

- Installed Node.js and the ZeroBounce MCP server
- Obtained a ZeroBounce API key (see **Getting Your API Key** in `README.md`)
- Verified your environment with `node --version` and `npm --version`

You only need the repository locally if you're developing the server itself—otherwise installing from npm/git is sufficient.

## Installation & Configuration

### 1. Install the MCP server

```bash
npm install git+https://github.com/zerobounce/zerobounce-mcp.git
```



### 2. Configure Cursor

1. **Open Cursor and navigate to Settings → Cursor Settings**
   - Click on the Cursor menu
   - Select "Settings" → "Cursor Settings"

2. **Select the MCP tab**
   - Look for the "MCP" section in settings

3. **Click "Add new global MCP server"**
   - This will open a configuration editor

4. **Copy the configuration**
   You can copy and paste the configuration below:

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

5. **Replace `YOUR_API_KEY`**
   - Replace with your actual ZeroBounce API key
   - You can get your API key from [ZeroBounce Dashboard](https://www.zerobounce.net)

6. **Restart Cursor**
   - Close and reopen Cursor for the changes to take effect

## Getting Your API Key

See **"Getting Your API Key"** in `README.md` for steps to obtain and manage your ZeroBounce API key.

## Verifying Installation

After installation, verify the server is running:

1. **Open the Composer** (⌘/Ctrl + I)
2. **Try a test command**:
   ```
   How many ZeroBounce credits do I have?
   ```
3. **You should see** the server respond with your credit balance

If the tools don't appear, check the troubleshooting section below.

## Usage in Cursor

### In the Composer

Ask natural language questions:
```
Validate the email "test@example.com"
Check if "user@domain.com" is valid
How many credits do I have?
```

### In Chat

Use the ZeroBounce tools directly in your coding conversations:
```
Can you validate this email address for me: user@example.com
```

### Example Workflows

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

## Troubleshooting

### Common Issues

#### Server Not Appearing

**Problem:** ZeroBounce tools don't show up in Cursor

**Solutions:**
- Ensure you're using Cursor v1 or greater (check Help → About)
- Verify Node.js is installed: run `node --version` in terminal
- Restart Cursor completely (quit and reopen)
- Check the MCP configuration in Settings → Cursor Settings → MCP

#### Invalid API Key

**Problem:** Error message about invalid API key

**Solutions:**
- Verify your API key at [ZeroBounce Dashboard](https://www.zerobounce.net)
- Ensure there are no extra spaces in the configuration
- Check that the API key hasn't expired
- Try regenerating your API key in the dashboard

#### Connection Errors

**Problem:** Cannot connect to ZeroBounce API

**Solutions:**
- Check your internet connection
- Verify no firewall is blocking `api.zerobounce.net`
- Check if a proxy is interfering with connections
- Try using a different network

### Viewing Logs

To see detailed error messages:

1. Open Cursor Settings (⌘/Ctrl + ,)
2. Navigate to Cursor Settings → MCP
3. Click on "View Logs" for the zerobounce server
4. Look for error messages or connection issues

### Still Having Issues?

- Check the [main documentation](../README.md)
- Search [GitHub Issues](https://github.com/zerobounce/zerobounce-mcp/issues)
- Open a new issue with:
  - Your Cursor version
  - Your Node.js version (`node --version`)
  - Your operating system
  - The exact error message
  - Your configuration (without the API key)
