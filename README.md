# ZeroBounce MCP Server

A comprehensive Model Context Protocol (MCP) server that provides full-featured email validation, verification, and intelligence capabilities through ZeroBounce's API. This server enables AI coding assistants and MCP-compatible clients to validate email addresses, find emails, score email quality, search domains, and much more.

## Features

### Core Capabilities
- **Email Validation**: Validate single or multiple email addresses with detailed results
- **Batch Processing**: Efficiently process large volumes of emails via CSV upload
- **AI Scoring**: Evaluate email quality and deliverability using AI via bulk CSV file uploads
- **Email Finder**: Find email addresses based on name and company/domain
- **Domain Search**: Search for all email addresses in a domain
- **Activity Data**: Check if an email address has been recently active
- **Credit Management**: Monitor remaining credits in your ZeroBounce account
- **Usage Analytics**: Get detailed API usage reports for any date range
- **Warmup**: Manage warmup sending accounts, engagement rules, seeds, statistics and SPF/DKIM/DMARC checks (needs a separate [Warmup API key](#warmup-api-key))

### Key Benefits
- 🚀 **Fast Integration**: Quick setup with MCP-compatible clients
- 🔒 **Secure**: API key management with environment variable support
- 📊 **Broad Coverage**: Access to all major ZeroBounce API endpoints exposed by the official Node SDK and suitable for MCP tools
- 🎯 **Accurate**: Industry-leading email validation accuracy
- 🔄 **Real-time**: Instant validation and scoring results

## Quick Start

1. **Install the MCP server globally**
```bash
npm install -g @zerobounce/mcp
```

   This will install the `zerobounce-mcp` command globally.

2. **Get your ZeroBounce API key** from the [ZeroBounce Dashboard](https://www.zerobounce.net)

3. **Add to your MCP client** (Cursor, VS Code, Claude Desktop, etc.):

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

4. **Start using it** in your AI assistant:

```
Validate the email address "test@example.com"
```

## Getting Your API Key

Your ZeroBounce API key is available in the ZeroBounce dashboard:

- **Sign in** to your ZeroBounce account
- **Navigate** to the API / Developer or Integrations section
- **Create or copy** an API key for this integration
- **Use different keys** for development, staging, and production when possible

> **Note:** Treat your API key like a password. Do not share it or commit it to version control.

## Warmup API key

Warmup is a separate ZeroBounce product with its **own API key and its own host**
(`https://warmup-api.zerobounce.net`). The validation key above is not accepted there, so
the Warmup tools need a second key:

```json
{
  "mcpServers": {
    "zerobounce": {
      "command": "zerobounce-mcp",
      "args": ["--api-key=YOUR_API_KEY", "--warmup-api-key=YOUR_WARMUP_API_KEY"]
    }
  }
}
```

`ZEROBOUNCE_WARMUP_API_KEY` works in place of the flag, the same way `ZEROBOUNCE_API_KEY`
does, and the flag wins when both are set.

The Warmup key is **optional**. Leave it out and the 26 `warmup_*` tools are not advertised
at all, so a client never sees a tool that cannot work. Supply it and the server exposes 59
tools instead of 33.

In HTTP mode the Warmup key is a per-request header, `X-ZeroBounce-Warmup-Api-Key` — see
[Remote (HTTP) Mode](#remote-http-mode).

`--warmup-url` (or `ZEROBOUNCE_WARMUP_API_URL`) points the Warmup client at a different
host, which is how the test suite reaches a stub. There is **no regional Warmup host**:
`warmup-api-us` and `warmup-api-eu` do not resolve, so only an explicit `https://` URL is
accepted and shorthands such as `us` are refused.

## MCP Client Configuration

Most MCP-compatible clients use the same basic configuration shape. A minimal example looks like:

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

Alternatively, supply the key through the `ZEROBOUNCE_API_KEY` environment variable instead of the flag:

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

The `--api-key` flag takes precedence when both are set.

### Referencing an existing environment variable

Some clients let you reference a variable that already exists in their own environment,
rather than writing the key into the config file:

```json
{
  "mcpServers": {
    "zerobounce": {
      "command": "zerobounce-mcp",
      "env": { "ZEROBOUNCE_API_KEY": "${ZEROBOUNCE_API_KEY}" }
    }
  }
}
```

> **⚠️ This only works if the variable is present in the environment of the client
> process itself** — not merely in your shell. A desktop client started from a macOS
> Dock icon, Spotlight, or a Windows Start-menu shortcut does **not** read `~/.zshrc`,
> `~/.bashrc`, or `~/.profile`, so an export placed there will be invisible to it.
>
> When the variable is missing, some clients pass the unresolved text
> `${ZEROBOUNCE_API_KEY}` through as the key. That value is non-empty, so this server
> accepts it and starts normally: the client reports the server as connected and lists
> every tool, but each API call fails with `api_key is invalid`. The symptom looks like
> an expired key or a ZeroBounce outage, while the actual cause is that the reference
> was never expanded.
>
> To confirm, check whether the variable is really visible to GUI applications:
>
> ```bash
> launchctl getenv ZEROBOUNCE_API_KEY   # macOS; empty output means it is not set
> ```
>
> On macOS you can publish it to the GUI session, expanding the value through an
> interactive shell so it does not silently resolve to an empty string:
>
> ```bash
> zsh -ic 'launchctl setenv ZEROBOUNCE_API_KEY "$ZEROBOUNCE_API_KEY"'
> ```
>
> Restart the client afterwards — it only inherits the variable if it is launched after
> the change. Note that `launchctl setenv` does not survive a reboot; make it permanent
> with a login LaunchAgent, or avoid the problem entirely by writing the key literally
> into the config as shown above.


Select your client below for detailed, client-specific setup steps:

- **[Cursor](docs/configuration-cursor.md)** – Configure ZeroBounce MCP for Cursor IDE
- **[VS Code](docs/configuration-vscode.md)** – Configure ZeroBounce MCP for Visual Studio Code
- **[Other / generic clients](docs/configuration-other.md)** – Configure ZeroBounce MCP for Claude Desktop, Continue, Zed, and others


## Regional API hosts

ZeroBounce serves the main API from three hosts. Pick one with `--url`, or with
the `ZEROBOUNCE_API_URL` environment variable:

```bash
zerobounce-mcp --url us      # https://api-us.zerobounce.net/v2
zerobounce-mcp --url eu      # https://api-eu.zerobounce.net/v2
zerobounce-mcp               # https://api.zerobounce.net/v2 (default)
```

An explicit `https://` URL is also accepted, which is how you point the server
at a test double. A non-https or malformed URL is refused outright rather than
quietly replaced with production, so the server never sends your key to a host
you did not choose.

This setting applies to the **main API only**. There is no regional bulk or
warmup host, so the bulk file jobs, the List Evaluator, the Inbox Placement
Tester and the Warmup API are unaffected by it.

In HTTP mode the host is fixed when the server starts and cannot be set
per request: the API key arrives from the caller, so a request that could also
choose the host could point that key at a server of its own choosing.

## Remote (HTTP) Mode

The server can also run as a stateless [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http)
endpoint for hosting on a remote MCP platform:

```bash
npm run build
PORT=3000 node dist/index.js --http
```

- MCP endpoint: `POST /mcp`. A browser `GET` returns `405 Method Not Allowed`, which is expected.
- Health check: `GET /health`
- Enable it with `--http` or `MCP_TRANSPORT=http`. The port comes from `--port` or `PORT` (default `3000`).
- The server binds to `127.0.0.1` by default, so it is only reachable from the same machine. In a
  container or on a hosting platform, terminate HTTPS at a trusted proxy, set
  `MCP_TLS_TERMINATED=true`, and bind all interfaces with `--host 0.0.0.0` or `MCP_HOST=0.0.0.0`.
  Keep the connection between the proxy and this HTTP listener on a trusted private network.

In HTTP mode **each caller supplies their own ZeroBounce API key** on every request, either as
`X-ZeroBounce-Api-Key: <key>` or `Authorization: Bearer <key>`. `ZEROBOUNCE_API_KEY` and
`--api-key` are ignored, so a hosted deployment never spends a shared key's credits. A request
without a key is rejected with `401`.

A caller who also wants the Warmup tools adds `X-ZeroBounce-Warmup-Api-Key: <warmup key>`.
That key is a credential in its own right, so it travels per request exactly like the
validation key: `ZEROBOUNCE_WARMUP_API_KEY` and `--warmup-api-key` are ignored in HTTP mode,
and a key is never carried over from one request to the next. A request that omits it simply
gets a server with no `warmup_*` tools; the validation tools still work.

```json
{
  "mcpServers": {
    "zerobounce": {
      "url": "https://your-host.example.com/mcp",
      "headers": {
        "X-ZeroBounce-Api-Key": "your_api_key_here",
        "X-ZeroBounce-Warmup-Api-Key": "your_warmup_api_key_here"
      }
    }
  }
}
```

### Deploying from GitHub

Most hosted MCP platforms that build from a GitHub repository need these settings:

| Setting | Value |
|---|---|
| Repository / Branch | `zerobounce/zerobounce-mcp` / `main` |
| Runtime / Preset | Node.js (MCP TypeScript SDK) |
| Repository Root Directory | *(empty)* |
| Build Command | `npm ci && npm run build` |
| Start Command | `node dist/index.js --http --host 0.0.0.0` |
| Port | `3000` |
| Environment Variables | none required (set `PORT` only if you change the port) |


## Tools

The ZeroBounce MCP server provides the following tools, organized by category:


### Validation Tools

#### `validate_email`

Validate a single email address using ZeroBounce API. Returns detailed validation results including status, sub-status, and additional metadata.

#### `validate_batch`

Validate multiple email addresses in batch. More efficient for validating multiple emails at once.

### Account Tools

#### `get_credits`

Get the number of credits remaining in your ZeroBounce account.

#### `get_api_usage`

Get API usage statistics for a date range. Shows validation counts by status and sub-status.

### Bulk Validation File Tools

#### `bulk_validate_send_file`

Send a CSV file for bulk email validation. Returns a file ID for tracking.

#### `bulk_validate_file_status`

Get the status of a bulk validation file upload.

#### `bulk_validate_get_file`

Get the results of a completed bulk validation file.

#### `bulk_validate_delete_file`

Delete a bulk validation file from your account.

### AI Scoring Tools

#### `bulk_ai_scoring_send_file`

Send a CSV file for bulk AI email scoring. Returns a file ID for tracking.

#### `bulk_ai_scoring_file_status`

Get the status of a bulk AI scoring file upload.

#### `bulk_ai_scoring_get_file`

Get the results of a completed bulk AI scoring file.

#### `bulk_ai_scoring_delete_file`

Delete a bulk AI scoring file from your account.

### Email Finder Tools

#### `find_email`

Find an email address based on domain, name, and/or company.

> **Note:** Bulk Email Finder file operations are not available via the official Node SDK and are not exposed as MCP tools.

### Domain Search Tools

#### `domain_search`

Search for email addresses in a domain.

> **Note:** Bulk Domain Search file operations are not available via the official Node SDK and are not exposed as MCP tools.

### Activity Data Tools

#### `get_activity_data`

Get activity data for an email address to see if it has been active recently.

### Warmup Tools

These 26 tools cover every documented operation of the [Warmup API](https://www.zerobounce.net/docs/warmup-api).
They are only advertised when a **Warmup API key** is configured — see
[Warmup API key](#warmup-api-key). They never use the validation key.

**Sending accounts**

#### `warmup_list_sending_accounts`

List every sending account belonging to the Warmup key's team.

#### `warmup_get_sending_account`

Get one sending account by `fromAddress`.

#### `warmup_add_sending_account`

Add a from-address to warmup. `onboardingModel: "self_managed"` runs your own mailbox and
requires `engagementRuleId` (0-4). `"zb_managed"` has ZeroBounce provision the mailbox and
takes `emailContent` and `managedSending` instead; it rejects `engagementRuleId`.

#### `warmup_update_sending_account`

Change an account's `engagementRuleId` (0-4), `statusId` (0-8; 4 Paused, 5 Disabled) and
`autoEnable` flag. `autoEnable: true` is accepted only for an account that is not active.

#### `warmup_delete_sending_account`

Remove a sending account. **Destructive**: the account and its warmup history go with it.

#### `warmup_change_from_address`

Move an account and its history from `oldFromAddress` to `newFromAddress`. Despite the
`/smtp-credentials` path it uses, no SMTP credentials are stored.

#### `warmup_list_from_addresses`

List the registered from-addresses. Optional `searchFrom` (letters, digits and `. - _ @ +`
only), `offset` and `limit`.

**Engagement rules**

#### `warmup_get_engagement_rules`

The rule catalogue: -1 Custom, 0 Default, 1 Slow Pace, 2 Repair, 3 Boost, 4 Protect.

#### `warmup_set_engagement_rule`

Set a standard rule (`ruleId` 0-4) on an address (`cFrom`).

#### `warmup_get_custom_engagement`

An address's custom rule, including `can_update` and the `remaining_seconds` of the cooldown.

#### `warmup_create_custom_engagement`

Create a custom rule from `replyPct` (5-45), `importantPct` (5-40) and `clickPct` (0-70, and
at most `importantPct` x 1.75). Starts a 7-day cooldown before the rule can be updated.

#### `warmup_update_custom_engagement`

Update a custom rule. During the 7-day cooldown the API answers with HTTP 429.

#### `warmup_delete_custom_engagement`

Delete a custom rule and fall back to a standard rule (`engagementRuleId` 1-4).

**Seeds, progress and statistics**

#### `warmup_get_seeds`

The seed list.

#### `warmup_download_seeds`

The seed list as **CSV text** (columns `seed,provider`), returned as-is rather than wrapped
in JSON.

#### `warmup_get_seed_count`

The number of seeds.

#### `warmup_get_progress_today`

Today's warmup progress.

#### `warmup_get_sent_today`

Messages sent today.

#### `warmup_get_emails_per_day`

The current daily sending volume.

#### `warmup_get_statistics`

Statistics for a `fromAddress`. An address with no history returns zeros.

#### `warmup_get_statistics_per_day`

Daily statistics between `startDate` and `endDate` (`YYYY-MM-DD`), inclusive.

#### `warmup_get_statistics_detailed`

Detailed statistics for an address (`cFrom`).

#### `warmup_download_statistics`

An address's statistics as **CSV text**, returned as-is rather than wrapped in JSON.

#### `warmup_get_from_address_statistics`

Statistics for one from-address.

**Diagnostics**

#### `warmup_check_domain_dmarc`

SPF, DKIM and DMARC status of a from-address's domain, with an optional `dkimSelector`.

> `fromAddress` must be a full **email address** such as `sender@example.com`. The live API
> answers `Please provide a valid email address` for a bare domain, although the public docs
> describe a domain. A bare domain is rejected before the call is made.

#### `warmup_test_smtp_configuration`

Check that SMTP credentials connect and hand off a message. Nothing is stored, and the test
message goes to a ZeroBounce test recipient rather than to `fromAddress`. The username and
password are masked in every error from this call.

> The live API answers any failed SMTP login with HTTP 500 rather than a 4xx. That is an API
> bug, not a transport failure.

### Limitations and Non-Supported Endpoints

- **Custom filters / filter management**: Not available via the official ZeroBounce Node SDK and therefore not exposed as MCP tools.
- **List Evaluator**: The List Evaluator endpoint is not supported by the Node SDK and is not implemented in this MCP server.
- **Per-email AI scoring tool**: AI scoring is currently supported only via bulk CSV file operations, not as a single-email scoring tool.

## Resources

The server provides the following resources:

### `zerobounce://config`

Current ZeroBounce API configuration: the main API base URL and whether a validation key is
configured, plus the Warmup base URL and whether a Warmup key is configured. Keys themselves
are never included.

## Usage Examples

### Basic Email Validation

**Validate a single email:**
```text
Validate the email address "test@example.com"
```

**Validate with IP address for better accuracy:**
```text
Validate "test@example.com" from IP address "192.168.1.1"
```

**Validate multiple emails in batch:**
```text
Check if these emails are valid: ["user1@example.com", "user2@example.com", "user3@example.com"]
```

### Account Management

**Check remaining credits:**
```text
How many credits do I have left in my ZeroBounce account?
```

**Get usage statistics:**
```text
Show me my ZeroBounce API usage for January 2024
```

**Show usage from specific dates:**
```text
Get my API usage from 2024-01-01 to 2024-01-31
```

### AI Email Scoring

**Score emails via CSV upload:**
```text
Use AI to score the quality and deliverability of these email addresses and return the results as a CSV: [paste CSV content]
```

### Email Finding

**Find an email by name and domain:**
```text
Find the email for John Doe at example.com
```

**Find email by name and company:**
```text
Find the email for John Doe at Example Corp (example.com)
```

### Domain Search

**Search for emails in a domain:**
```text
Search for all email addresses at example.com
```

**Search with filters:**
```text
Find emails for people named John at example.com
```

### Activity Data

**Check email activity:**
```text
Check if test@example.com has been active recently
```

### Bulk Operations

**Upload a file for bulk validation:**
```text
Bulk validate the emails in this CSV file: [paste CSV content]
```

**Check bulk validation status:**
```text
Check the status of my bulk validation file abc123
```

**Get bulk validation results:**
```text
Get the results for my completed bulk validation file abc123
```

## Status Values

ZeroBounce returns the following status values:

- **valid**: Email address is valid
- **invalid**: Email address is invalid
- **catchall**: Domain accepts all emails (catch-all)
- **do_not_mail**: Email address is on a do-not-mail list
- **spamtrap**: Email address is a spamtrap
- **abuse**: Email address is associated with abuse
- **unknown**: Unable to determine validity

## Sub-Status Values

Common sub-status values include:

- **toxic**: Email address contains toxic words
- **disposable**: Email address is from a disposable email service
- **role_based**: Email address is role-based (e.g., admin@, info@)
- **possible_trap**: Email address might be a trap
- **global_suppression**: Email address is on a global suppression list
- **timeout_exceeded**: Validation timeout exceeded
- **mail_server_temporary_error**: Temporary mail server error
- **mail_server_did_not_respond**: Mail server did not respond
- **greylisted**: Email address is greylisted
- **antispam_system**: Blocked by antispam system
- **does_not_accept_mail**: Domain does not accept mail
- **exception_occurred**: Exception occurred during validation
- **failed_syntax_check**: Email failed syntax check
- **mailbox_quota_exceeded**: Mailbox quota exceeded
- **possible_typo**: Possible typo in email address
- **unroutable_ip_address**: Unroutable IP address
- **leading_period_removed**: Leading period was removed
- **does_not_accept_mail_from_mailer_daemon**: Does not accept mail from mailer daemon
- **address_is_blocked**: Address is blocked
- **failed_antispam_check**: Failed antispam check
- **mailbox_not_found**: Mailbox not found
- **unroutable_mail_server**: Unroutable mail server
- **invalid**: Invalid email address
- **mail_server_did_not_respond_within_timeout_period**: Mail server did not respond within timeout
- **address_failed_validation**: Address failed validation
- **mailbox_storage_exceeded**: Mailbox storage exceeded
- **mailbox_administratively_disabled**: Mailbox administratively disabled
- **domain_not_found**: Domain not found
- **address_is_on_a_global_suppression_list**: Address is on a global suppression list

## Security Best Practices

### Protecting Your API Key

Your ZeroBounce API key is sensitive and should be protected:

1. **Never Commit API Keys**: Add configuration files with API keys to `.gitignore`
   ```gitignore
   mcp.json
   .env
   ```

2. **Use Separate Keys**: Use different API keys for development, staging, and production

3. **Rotate Keys Regularly**: Periodically rotate your API keys from the ZeroBounce dashboard

4. **Monitor Usage**: Regularly check your API usage to detect unauthorized access

## Development

For local development on this MCP server:

- **Install dependencies:**
  ```bash
  npm install
  ```

- **Build the project:**
  ```bash
  npm run build
  ```

- **Install the CLI globally (optional, for local testing):**
  ```bash
  npm install -g .
  ```

  After this, you can use the `zerobounce-mcp` command in your MCP client config, for example:
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

- **Run the tests:**
  ```bash
  npm run typecheck && npm run build && npm test
  ```

  `npm test` runs the stdio test, which calls the live ZeroBounce API (pass `--api-key=KEY` to
  `node test-mcp.js` for full coverage), and then `test-http.js`. The HTTP test runs offline
  against a fake API and checks routing, auth, every tool, and per-request API key isolation.

## Error Handling

The server handles errors gracefully and returns descriptive error messages:

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Missing API key | API key not provided | Add the `--api-key` argument or set `ZEROBOUNCE_API_KEY` |
| Invalid API key | API key is incorrect or expired | Verify your API key in the ZeroBounce dashboard |
| `api_key is invalid` on every call, though the server connects | Config used `${ZEROBOUNCE_API_KEY}` but the client could not expand it, so the literal placeholder was sent as the key | See **Referencing an existing environment variable** — publish the variable to the client's environment, or write the key literally into the config |
| Network errors | Cannot connect to ZeroBounce API | Check your internet connection and firewall settings |
| Rate limiting | Too many requests | Wait and retry, or upgrade your ZeroBounce plan |
| Invalid email format | Email address format is invalid | Check the email address format |
| Invalid date format | Date not in YYYY-MM-DD format | Use the correct date format (e.g., "2024-01-31") |
| Insufficient credits | Not enough credits in account | Add credits to your ZeroBounce account |
| File not found | Bulk validation file ID is invalid | Verify the file ID from the upload response |

### Error Response Format

Errors are returned in a structured format:
```json
{
  "error": "Error type",
  "message": "Detailed error description",
  "details": "Additional context (if available)"
}
```

---

**Made with ❤️ for the MCP community**

