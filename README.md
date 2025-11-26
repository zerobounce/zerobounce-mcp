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

### Key Benefits
- 🚀 **Fast Integration**: Quick setup with MCP-compatible clients
- 🔒 **Secure**: API key management with environment variable support
- 📊 **Broad Coverage**: Access to all major ZeroBounce API endpoints exposed by the official Node SDK and suitable for MCP tools
- 🎯 **Accurate**: Industry-leading email validation accuracy
- 🔄 **Real-time**: Instant validation and scoring results

## Quick Start

1. **Install the MCP server globally**
```bash
npm install -g git+https://github.com/zerobounce/zerobounce-mcp.git
```

   This will:
   - Clone the repository
   - Install dependencies
   - Build the server
   - Install the `zerobounce-mcp` command globally

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

Select your client below for detailed, client-specific setup steps:

- **[Cursor](docs/configuration-cursor.md)** – Configure ZeroBounce MCP for Cursor IDE
- **[VS Code](docs/configuration-vscode.md)** – Configure ZeroBounce MCP for Visual Studio Code
- **[Other / generic clients](docs/configuration-other.md)** – Configure ZeroBounce MCP for Claude Desktop, Continue, Zed, and others


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

### Limitations and Non-Supported Endpoints

- **Custom filters / filter management**: Not available via the official ZeroBounce Node SDK and therefore not exposed as MCP tools.
- **List Evaluator**: The List Evaluator endpoint is not supported by the Node SDK and is not implemented in this MCP server.
- **Per-email AI scoring tool**: AI scoring is currently supported only via bulk CSV file operations, not as a single-email scoring tool.

## Resources

The server provides the following resources:

### `zerobounce://config`

Current ZeroBounce API configuration (base URL and whether API key is configured).

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

## Error Handling

The server handles errors gracefully and returns descriptive error messages:

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Missing API key | API key not provided | Add `--api-key` argument |
| Invalid API key | API key is incorrect or expired | Verify your API key in the ZeroBounce dashboard |
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

