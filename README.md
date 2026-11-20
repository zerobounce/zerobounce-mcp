# ZeroBounce MCP Server

Connect your AI assistant to your ZeroBounce account. The ZeroBounce
[Model Context Protocol](https://modelcontextprotocol.io) server lets Claude, ChatGPT, Cursor,
VS Code and any other MCP client validate and score email addresses, find emails and domains,
clean lists in bulk, run inbox placement tests and manage Warmup.

**The easiest way to use it is the hosted server at `https://mcp.zerobounce.net/mcp`.** You sign
in with your ZeroBounce account, so there is nothing to install and no API key to copy. This
repository is the open-source version of the same tools: the
[`@zerobounce/mcp`](https://www.npmjs.com/package/@zerobounce/mcp) package, which you run
yourself with an API key ([Run it yourself](#run-it-yourself)).

## Features

- **Email validation**: one address, up to 200 in one call, or whole CSV files in bulk
- **AI scoring**: how likely an address is to engage, for one address or a bulk file
- **Email finder and domain search**: a work email from a name and domain, or a domain's email format
- **Activity data**: whether an address has been active recently
- **List Evaluator**: a free quality estimate of a list before you validate it
- **Allow and block filters** on your account
- **Amazon S3 and SFTP/FTP bulk jobs**: validate, score and export files already in your storage
- **Inbox placement testing**: whether a campaign lands in the inbox or in spam at each provider
- **Warmup**: sending accounts, engagement rules, seeds, statistics and SPF/DKIM/DMARC checks
- **Credits and API usage** for your account

Tools that spend credits or change your account say so in their description, and deletes are
marked destructive, so your assistant asks before calling them. See [Tools](#tools).

## Connect to the hosted server

Add `https://mcp.zerobounce.net/mcp` to your client as a remote (HTTP) MCP server. No API key or
header goes in the configuration: the first time the client connects, it opens ZeroBounce in your
browser to sign in.

**Claude** (claude.ai and the desktop app): Settings → Connectors → **Add custom connector**,
with the URL `https://mcp.zerobounce.net/mcp`.

**Claude Code:**

```bash
claude mcp add --transport http zerobounce https://mcp.zerobounce.net/mcp
```

**ChatGPT:** add a custom connector (app) with the URL `https://mcp.zerobounce.net/mcp` and OAuth
authentication, where your plan allows custom connectors.

**Cursor** — install the plugin from this repo (**Customize → Plugins → Import from GitHub**
→ `zerobounce/zerobounce-mcp`): hosted MCP + the `zerobounce` skill. See
[`docs/CURSOR_MARKETPLACE.md`](docs/CURSOR_MARKETPLACE.md).

Or add the URL manually in `~/.cursor/mcp.json` or `.cursor/mcp.json` in a project:

```json
{
  "mcpServers": {
    "zerobounce": {
      "url": "https://mcp.zerobounce.net/mcp"
    }
  }
}
```

**VS Code** (`.vscode/mcp.json`):

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

Then ask your assistant, for example:

```
How many ZeroBounce credits do I have left?
Validate jane.doe@example.com
```

### Signing in and choosing permissions

The hosted server uses OAuth 2.1 with dynamic client registration, so clients set themselves up
automatically. When you connect, ZeroBounce shows a consent page where you:

1. **Sign in** to your ZeroBounce account.
2. **Choose what the assistant may do.** Reading your account (credit balance, usage, bulk file
   status and results, filters, inbox placement tests) is always granted. Each of these is
   optional:
   - **Spend credits**: validate and score emails, look up activity data, find emails and domains.
   - **Change account data** (marked high risk): upload and delete bulk files, start S3/SFTP jobs,
     manage filters and inbox placement tests, and run batch validation.
   - **Warmup**: the Warmup tools, using your team's Warmup API key. Offered to Owners and
     Admins once the team has generated a Warmup key.
3. **Pick the tools** within those permissions, and the **API region**: Default, US or EU.
   Single-address calls use that region's API. Bulk files, the Inbox Placement Tester and Warmup
   have no regional hosts and always use the global ones.

Your assistant only sees, and can only call, the tools you approved. To change them later, or to
get tools added in a server update, disconnect and connect again. Account Owners, Admins and Devs
can connect; team members without API access cannot.

Each connection is limited to 300 requests and 60 credit-spending tool calls per minute.

For AI agents, [`https://mcp.zerobounce.net/llms.txt`](https://mcp.zerobounce.net/llms.txt)
describes how to connect and lists every tool.

## Hosted or self-hosted?

| | Hosted (`mcp.zerobounce.net`) | Self-hosted (`@zerobounce/mcp`) |
| --- | --- | --- |
| Setup | Add a URL, sign in | Install Node.js 22+ and the npm package |
| Credentials | OAuth sign-in; no key in your config | Your API key (and Warmup key) in the config or environment |
| Permissions | Chosen per connection on the consent page | Everything the API key can do |
| Clients | Any client that supports remote MCP servers (Claude, ChatGPT, Cursor, VS Code, ...) | stdio clients, or your own HTTP deployment |
| Tools | Same tool names, titles and annotations | Same tool names, titles and annotations; argument names are camelCase (`fileId`, `ipAddress`) and bulk uploads take CSV text |

Use the hosted server unless you need to run everything on your own machine or network, pin a
specific version, or use a client without remote MCP support.

## Run it yourself

The npm package runs the same tools locally over stdio, or as your own HTTP server, with your
ZeroBounce API key.

### Quick start

Requires **Node.js 22 or later** (check with `node --version`).

1. **Install the MCP server globally**

   ```bash
   npm install -g @zerobounce/mcp
   ```

   This installs the `zerobounce-mcp` command.

2. **Get your ZeroBounce API key** from the [ZeroBounce dashboard](https://www.zerobounce.net)
   ([Getting your API key](#getting-your-api-key)).

3. **Add it to your MCP client** (Cursor, VS Code, Claude Desktop, etc.):

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

### Getting your API key

Your ZeroBounce API key is available in the ZeroBounce dashboard:

- **Sign in** to your ZeroBounce account
- **Navigate** to the API / Developer or Integrations section
- **Create or copy** an API key for this integration
- **Use different keys** for development, staging, and production when possible

> **Note:** Treat your API key like a password. Do not share it or commit it to version control.
> The hosted server needs no key: you sign in instead.

### Warmup API key

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

The Warmup key is **optional**. Leave it out and the 25 `warmup_*` tools are not advertised
at all, so a client never sees a tool that cannot work. Supply it and the server exposes 75
tools instead of 50.

In HTTP mode the Warmup key is a per-request header, `X-ZeroBounce-Warmup-Api-Key` — see
[Your own HTTP server](#your-own-http-server).

`--warmup-url` (or `ZEROBOUNCE_WARMUP_API_URL`) points the Warmup client at a different
host, which is how the test suite reaches a stub. There is **no regional Warmup host**:
`warmup-api-us` and `warmup-api-eu` do not resolve, so only an explicit `https://` URL is
accepted and shorthands such as `us` are refused.

### MCP Client Configuration

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

#### Command-line options

`zerobounce-mcp --help` (`-h`) and `--version` (`-v`) print and exit; neither needs a key. The key
can also be given as `-k <key>` (same as `--api-key`). An unknown option or a stray argument is
refused with `Unknown argument: ...` and the server does not start, so a misspelt `--api-ky` is
never silently ignored.

#### Referencing an existing environment variable

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

- **[Cursor plugin](docs/CURSOR_MARKETPLACE.md)** – Hosted MCP and the `zerobounce` skill (import this repo under Customize → Plugins)
- **[Cursor](docs/configuration-cursor.md)** – Manual MCP config, including self-hosted `@zerobounce/mcp`
- **[VS Code](docs/configuration-vscode.md)** – Configure ZeroBounce MCP for Visual Studio Code
- **[Other / generic clients](docs/configuration-other.md)** – Configure ZeroBounce MCP for Claude Desktop, Continue, Zed, and others


### Regional API hosts

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

### Your own HTTP server

The server can also run as a stateless [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http)
endpoint, for hosting it on your own infrastructure or a remote MCP platform. (To use
ZeroBounce's own hosted server instead, see [Connect to the hosted server](#connect-to-the-hosted-server).)

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
- The `Host` header must name the server: the loopback names for a loopback bind, the bind
  address itself, or a name given with `--allowed-host <name>` (repeatable) or
  `MCP_ALLOWED_HOSTS` (comma-separated). A cross-origin `Origin` header is refused with `403`.
  This blocks DNS-rebinding attacks from web pages. On a wildcard bind (`0.0.0.0`) set your public
  host name this way; without it the server accepts any `Host` and logs a warning.
- A repeated `X-ZeroBounce-Api-Key`, `X-ZeroBounce-Warmup-Api-Key` or `Authorization` header, or an
  `X-ZeroBounce-Api-Key` that differs from the bearer token, is refused with `400`.

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

#### Deploying from GitHub

Most hosted MCP platforms that build from a GitHub repository need these settings:

| Setting | Value |
|---|---|
| Repository / Branch | `zerobounce/zerobounce-mcp` / `main` |
| Runtime / Preset | Node.js (MCP TypeScript SDK) |
| Repository Root Directory | *(empty)* |
| Build Command | `npm ci && npm run build` |
| Start Command | `node dist/index.js --http --host 0.0.0.0` |
| Port | `3000` |
| Environment Variables | `MCP_TLS_TERMINATED=true` (required; set `PORT` only if you change the port) |

The server refuses to bind anything but loopback (`127.0.0.1`, `::1` or `localhost`) unless
`MCP_TLS_TERMINATED=true` is set, and exits with `Non-loopback HTTP binding requires
MCP_TLS_TERMINATED=true and a trusted TLS-terminating proxy.` Set it only when the platform
terminates HTTPS in front of the server, because every request carries a caller's API key.


## Tools

The ZeroBounce MCP server provides the following tools, organized by category.

Tool names, titles and annotations match the hosted ZeroBounce MCP server
(`mcp.zerobounce.net`), so a model sees the same tools whichever server it is connected to.
Every tool carries a `title` and `readOnlyHint` / `destructiveHint` / `idempotentHint` /
`openWorldHint` annotations, and its description says when to use it and whether it spends
credits (`CREDITS:`) or changes the account (`WRITE:`). Tools that delete or overwrite data
(bulk file deletes, `delete_filter`, `delete_inbox_placement_test`, and the warmup updates
and deletes) are marked `destructiveHint: true`, so clients ask before calling them.

Two endpoints are deliberately not exposed, as on the hosted server: setting the Inbox
Placement webhook (it applies to the whole API key and is set in the ZeroBounce dashboard),
and the Warmup API's SMTP configuration test (it takes the mailbox's SMTP password, which
would pass through the conversation).


### Validation Tools

#### `validate` (alias `validate_email`)

Validate a single email address. Returns status, sub-status and hygiene fields. Optional:
`ipAddress`, `timeout` (3-60 seconds), `activityData`, `verifyPlus`, `domainInfo` (adds
`domain_website_exists` and the WHOIS `domain_registrant_company_name`) and `usePost`.

#### `validate_batch`

Validate multiple email addresses in batch. More efficient for validating multiple emails at once.

### Account Tools

#### `get_credits` (alias `get_account_credits`)

Get the number of credits remaining in your ZeroBounce account.

#### `get_api_usage`

Get API usage statistics for a date range. Shows validation counts by status and sub-status.

### Bulk Validation File Tools

#### `send_file`

Send a CSV file for bulk email validation. Takes `fileContent` and `fileName`, plus the
optional `returnUrl`, `hasHeaderRow` (sent as `false` when left out), `removeDuplicate`,
`allowPhase2` and the 0-based column indexes `emailAddressColumn`, `firstNameColumn`,
`lastNameColumn`, `genderColumn` and `ipAddressColumn`. A `returnUrl`, when given, must
be an HTTPS callback URL on a public host (port 443, no credentials, no private or special-purpose
address); the server refuses anything else before the request. Returns a file ID for tracking.

#### `file_status`

Get the status of a bulk validation file upload.

#### `get_file`

Get the results of a completed bulk validation file. Optional `downloadType` (`phase_1`,
`phase_2` or `combined`) and `activityData`. `scoring_get_file` takes `downloadType` too.

#### `delete_file`

Delete a bulk validation file from your account.

### AI Scoring Tools

#### `scoring_send_file`

Send a CSV file for bulk AI email scoring. Takes `fileContent` and `fileName`, plus the
optional `returnUrl`, `hasHeaderRow` (sent as `false` when left out), `removeDuplicate` and
the 0-based `emailAddressColumn`. `returnUrl` follows the same rules as for
`send_file`: HTTPS, port 443, public host, no credentials. Returns a file ID for tracking.

#### `scoring_file_status`

Get the status of a bulk AI scoring file upload.

#### `scoring_get_file`

Get the results of a completed bulk AI scoring file.

#### `scoring_delete_file`

Delete a bulk AI scoring file from your account.

#### `score_email`

Score a single email address in real time (`/v2/scoring`). Returns the address and its
numeric score. Set `usePost` to send the key and address form-encoded over POST instead
of in the query string.

### Email Finder Tools

#### `find_email_format`

Find an email address based on domain, name, and/or company.

#### `send_email_finder_file`

Send a CSV file for bulk email finding. Takes `fileContent` and `fileName`, plus the 0-based
column indexes `domainColumn`, `firstNameColumn`, `middleNameColumn`, `lastNameColumn` and
`fullNameColumn`, and `hasHeaderRow` (sent as `false` when left out). `firstNameColumn` or
`fullNameColumn` is required: the API needs a name to work from. The endpoint takes no
callback URL. Returns a file ID for tracking.

#### `email_finder_file_status`

Get the status of a bulk email finder file upload.

#### `email_finder_get_file`

Get the results of a completed bulk email finder file.

#### `email_finder_delete_file`

Delete a bulk email finder file from your account.

### Domain Search Tools

#### `find_domain`

Search for email addresses in a domain.

#### `send_domain_search_file`

Send a CSV file for bulk domain search. Takes `fileContent` and `fileName`, plus the 0-based
`domainColumn` and `hasHeaderRow` (sent as `false` when left out). The endpoint takes no
callback URL. Returns a file ID for tracking.

#### `domain_search_file_status`

Get the status of a bulk domain search file upload.

#### `domain_search_get_file`

Get the results of a completed bulk domain search file.

#### `domain_search_delete_file`

Delete a bulk domain search file from your account.

### Activity Data Tools

#### `get_activity`

Get activity data for an email address to see if it has been active recently.

### Warmup Tools

These 25 tools cover every documented operation of the [Warmup API](https://www.zerobounce.net/docs/warmup-api)
except `test_smtp_configuration`, which takes an SMTP password.
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

### Inbox Placement Tester Tools

The Inbox Placement Tester (`bulkapi.zerobounce.net/api/ipt`) reports where a campaign
actually lands at each mailbox provider: inbox, spam, or missing. You create a test,
send your campaign to the seed addresses it returns, then read the results back.

This API authenticates with an `Authorization: Bearer` header rather than an `api_key`
parameter, so the key never appears in a request URL. It uses the same ZeroBounce API
key as the rest of the server; no extra configuration is needed.

#### `get_inbox_placement_providers`

List the seed providers and their seed addresses available for new tests.

#### `get_inbox_placement_test_types`

List the supported test types and which one is the default.

#### `create_inbox_placement_test`

Start a test. Takes `name` (unique, at most 64 characters) and optionally `testType`
(1 = Email, which also requires `senderEmail`; 2 = Unique ID; 3 = Auto Alias), the seeds
to use (`providerIds`, `seedIds`, or `providers` as `[{ id, maxSeeds }]` to cap seeds
per provider). Results also go to the API key's saved webhook, which is set in the
ZeroBounce dashboard.

#### `get_inbox_placement_test`

Get one test and its placement results by `testId`.

#### `list_inbox_placement_tests`

List tests, newest first. Filters: `status` (`running` or `finished`), `createdAfter`
and `createdBefore` (ISO 8601), `page`, and `pageSize` (1 to 100).

#### `delete_inbox_placement_test`

Delete a finished test. A running test cannot be deleted.

#### `get_inbox_placement_webhook`

Get the webhook URL finished results are posted to for this API key. No tool changes it:
set, change or remove it in the ZeroBounce dashboard.
### List Evaluator Tools

#### `send_list_evaluator_file`

Upload a CSV to the List Evaluator and get back a `file_id`.

#### `get_list_evaluator_result`

Fetch the evaluation for a `file_id`.

#### `send_evaluated_file`

Submit a finished evaluation for bulk validation. Takes the List Evaluator's
`fileId` -- despite what the public docs show, this endpoint is not a file
upload, and an upload is rejected with "file_id: This field is required".

### S3 and SFTP/FTP Bulk Tools

These run a bulk job over a file that already sits in your storage, so nothing
is uploaded through the MCP server. The bucket, server, path and protocol all
come from your ZeroBounce account settings.

Every job tool takes the same arguments:

| Argument | Required | Notes |
| --- | --- | --- |
| `fileName` | yes | Object key (S3) or path on the server (SFTP/FTP) |
| `returnUrl` | yes | HTTPS callback notified when the job finishes. The API refuses a job without one. Only use a URL you control: it receives your bulk results. Refused: credentials in the URL, a port other than 443, whitespace or control characters, and loopback, private, link-local, metadata or other special-purpose addresses (IPv6 forms that embed an IPv4 address included). Host names are not resolved: ZeroBounce's servers make the callback |
| `hasHeaderRow` | no | Defaults to `false` |
| `removeDuplicates` | no | Omitted when not given |

#### `list_s3files`

List the files in your S3 bucket. Optional `bucket` and `search` filters.

#### `validate_s3file` / `score_s3file` / `email_finder_s3file` / `domain_search_s3file`

Run bulk validation, AI scoring, email finder or domain search over an object in
your S3 bucket.

#### `validate_sftpfile` / `score_sftpfile` / `email_finder_sftpfile` / `domain_search_sftpfile`

The same four jobs over a file on your SFTP/FTP server.

#### `export_s3file`

Export a completed bulk job to S3. Takes `fileId` and an optional
`exportBucket`; without a bucket the API uses the output bucket configured on
your account.

#### `export_sftpfile`

Export a completed bulk job back to your SFTP/FTP server. Takes `fileId` and an
optional `exportPath` -- a path, not a bucket; without it the API uses the
export path configured on your account.

### Filter Tools

#### `add_filter`

Add a custom allow or block list filter. Takes `rule`, `target`, and `value`.

#### `list_filters`

List the custom filters on the account. Uses GET by default; set `usePost` to send POST.

#### `delete_filter`

Delete a custom filter. Takes the same `rule`, `target`, and `value` that created it.

### Tool Availability

On the hosted server, a connection lists the tools you approved on the consent page. When you run
the package yourself:

The ZeroBounce SDK (`@zerobounce/zero-bounce-sdk` 5.0.1) is bundled into `dist/index.js`, so
every tool is available in every install and nothing depends on an SDK on your machine. The
tool list changes only with the keys you supply: the 25 Warmup tools need a Warmup API key
(see above), so a server started without one exposes 50 tools. As a safety net the server still
hides a tool whose SDK method is missing from the bundle, rather than advertise one it cannot
run. Call the MCP `tools/list` method to see exactly what your server exposes.

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

`validate_email` and `validate_batch` return one of these `status` values, as listed in the
ZeroBounce [status codes reference](https://www.zerobounce.net/docs/email-validation-api-quickstart/v2-status-codes):

- **valid**: Email address is valid and safe to email
- **invalid**: Email address is invalid; remove it from your list
- **catch-all**: The domain accepts mail for any address, so the mailbox cannot be confirmed
- **spamtrap**: Email address is believed to be a spam trap
- **abuse**: Email address belongs to someone known to report mail as spam
- **do_not_mail**: Email address you should avoid mailing (role-based, disposable, toxic, and so on)
- **unknown**: The address could not be validated, for example because the mail server is offline

## Sub-Status Values

`sub_status` explains a result further. It is empty when there is nothing to add, and not every
`invalid` or `unknown` result has one.

| `status` | `sub_status` values |
| --- | --- |
| `valid` | `alias_address`, `leading_period_removed`, `alternate`, `gold`, `accept_all`, `role_based_accept_all`, `ai_agent_mailbox`, `allowed` |
| `invalid` | `does_not_accept_mail`, `failed_syntax_check`, `possible_typo`, `mailbox_not_found`, `no_dns_entries`, `mailbox_quota_exceeded`, `unroutable_ip_address` |
| `catch-all` | `ai_agent_mailbox` |
| `do_not_mail` | `role_based`, `disposable`, `role_based_catch_all`, `mx_forward`, `global_suppression`, `possible_trap`, `toxic`, `blocked` |
| `unknown` | `antispam_system`, `exception_occurred`, `failed_smtp_connection`, `forcible_disconnect`, `greylisted`, `mail_server_did_not_respond`, `mail_server_temporary_error`, `timeout_exceeded` |

`allowed` and `blocked` come from your own [custom filters](#filter-tools): an address that
matches an `allow` rule is returned as `valid` / `allowed`, and one that matches a `block` rule
as `do_not_mail` / `blocked`.

## Security Best Practices

With the hosted server no API key leaves your ZeroBounce account. Grant only the permissions the
assistant needs, and disconnect it (or connect again with fewer tools) when you no longer use it.

### Protecting Your API Key (self-hosted)

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

  `npm test` runs `test-http.js`, `test/client-key.test.ts`, `test/cli.test.ts` and
  `test/redaction.test.ts`. They run
  offline against a fake API, need no API key, and check routing, auth, every tool, per-request
  API key isolation, that no object holds the key in an inspectable property, and the
  command-line flags.

  The stdio test against the live ZeroBounce API is separate and spends credits. Run it with a
  real key (a placeholder key is blocked by Cloudflare rather than rejected by the API):
  ```bash
  npm run test:live -- --api-key="$ZEROBOUNCE_API_KEY"
  ```

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

A tool that fails returns an ordinary MCP tool result with `isError` set, and the message as
text prefixed with `Error: `:
```json
{
  "content": [{ "type": "text", "text": "Error: api_key is invalid" }],
  "isError": true
}
```

Messages longer than 1000 characters are truncated, and an HTML error page from the API is
reported as a one-line summary instead of the page itself.

In HTTP mode, a request rejected before it reaches a tool (a missing API key, or a method other
than `POST`) gets a JSON-RPC error with the matching HTTP status (`401`, `405`):
```json
{
  "jsonrpc": "2.0",
  "error": { "code": -32000, "message": "Method not allowed." },
  "id": null
}
```

## License

MIT. See [LICENSE](LICENSE).

---

**Made with ❤️ for the MCP community**

