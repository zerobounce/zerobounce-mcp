# ZeroBounce

Cursor plugin for the hosted ZeroBounce MCP server.

## MCP

```json
{
  "mcpServers": {
    "zerobounce": {
      "type": "http",
      "url": "https://mcp.zerobounce.net/mcp"
    }
  }
}
```

Sign in with your ZeroBounce account the first time a tool runs. No API key is stored in this plugin.

## Also included

- Skills: `zerobounce`, `validate-emails`, `clean-email-list`, `find-email`, `warmup-and-placement`
- Rules: when to call ZeroBounce, and keeping lists out of git
- Agents: `list-hygiene`, `deliverability`
- Commands: `check-credits`, `validate-email`, `clean-list`, `find-email`, `inbox-placement`

## Install

Import `https://github.com/zerobounce/zerobounce-mcp` as a marketplace, refresh it, then install **ZeroBounce**.
