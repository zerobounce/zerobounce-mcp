# Security Policy

## Reporting a Vulnerability

If you think you've found a security issue, please report it privately instead of opening a public issue.

**Email:** integrations@zerobounce.net (use a subject like `[zerobounce-mcp] Security`).

We'll look into reports as we can. If the issue is in the Zero Bounce API or service rather than this server, we may forward it to the right team.

## Supported Versions

We focus on the current release line for fixes. Using the latest release is recommended.

## Tips for Running This Server

* Don't commit API keys or `.env` files—use environment variables or a secrets manager.
* Keep dependencies up to date and upgrade when new versions are released.
* HTTP mode binds to `127.0.0.1` by default. Binding to `0.0.0.0` exposes the server to the network and requires `MCP_TLS_TERMINATED=true`, because every request carries a caller's API key.
* In HTTP mode each request supplies its own key and gets its own server instance, so keys are never shared between callers. Keep it that way.
* `--url` accepts only `us`, `eu` or an explicit `https://` URL; a non-https value is refused rather than silently replaced.

Thanks for helping keep things secure.
