# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 26 ZeroBounce Warmup tools, covering every documented Warmup operation: `warmup_list_sending_accounts`, `warmup_get_sending_account`, `warmup_add_sending_account`, `warmup_update_sending_account`, `warmup_delete_sending_account`, `warmup_change_from_address`, `warmup_list_from_addresses`, `warmup_get_engagement_rules`, `warmup_set_engagement_rule`, `warmup_get_custom_engagement`, `warmup_create_custom_engagement`, `warmup_update_custom_engagement`, `warmup_delete_custom_engagement`, `warmup_get_seeds`, `warmup_download_seeds`, `warmup_get_seed_count`, `warmup_get_progress_today`, `warmup_get_sent_today`, `warmup_get_emails_per_day`, `warmup_get_statistics`, `warmup_get_statistics_per_day`, `warmup_get_statistics_detailed`, `warmup_download_statistics`, `warmup_get_from_address_statistics`, `warmup_check_domain_dmarc` and `warmup_test_smtp_configuration`.
- `--warmup-api-key` and `ZEROBOUNCE_WARMUP_API_KEY` supply the Warmup API key in stdio mode. Warmup is a separate product with a separate key and host, so the main `ZEROBOUNCE_API_KEY` does not work there. Without a Warmup key the 26 Warmup tools are not advertised at all, so a client never sees a tool it cannot use.
- HTTP mode reads the Warmup key from a per-request `X-ZeroBounce-Warmup-Api-Key` header, alongside the existing `X-ZeroBounce-Api-Key`. Like the validation key it is never taken from the server environment and never shared between requests.
- `--warmup-url` and `ZEROBOUNCE_WARMUP_API_URL` point the Warmup client at a test host. Only an explicit `https://` URL is accepted: there is no regional Warmup host, so `us` and `eu` are refused rather than quietly ignored.
- `warmup_download_seeds` and `warmup_download_statistics` return the API's CSV as text rather than wrapping it in JSON.
- The `zerobounce://config` resource now also reports `warmupBaseUrl` and whether a Warmup key is configured.
- Inbox Placement Tester tools, covering all eight documented operations: `get_inbox_placement_providers`, `get_inbox_placement_test_types`, `create_inbox_placement_test`, `get_inbox_placement_test`, `list_inbox_placement_tests`, `delete_inbox_placement_test`, `get_inbox_placement_webhook`, and `set_inbox_placement_webhook`. This API tells you where a campaign actually landed -- inbox, spam, or nowhere -- per mailbox provider, and the server previously exposed none of it.
- `set_inbox_placement_webhook` and the `webhookUrl` argument of `create_inbox_placement_test` hold a callback URL to the same bar as a bulk `returnUrl`: HTTPS only, and never a private, link-local, or loopback address.
- `send_evaluated_file` submits a finished List Evaluator run for bulk validation. It takes the evaluator's `fileId`, not a file upload: the public docs describe an upload, which the API rejects with "file_id: This field is required".
- `email_finder_s3_file` and `domain_search_s3_file` run the bulk email finder and bulk domain search over a file already in your S3 bucket.
- SFTP/FTP bulk tools: `validate_sftp_file`, `score_sftp_file`, `email_finder_sftp_file`, `domain_search_sftp_file`, and `export_sftp_file`. The server, path and protocol come from your ZeroBounce account settings. `export_sftp_file` takes an optional `exportPath` -- a path, not a bucket.
- `validate_s3_file` and `score_s3_file` take `hasHeaderRow` and `removeDuplicates`, which the endpoints have always accepted but these tools never passed on.
- `--url` and `ZEROBOUNCE_API_URL` select the main API host: `us`, `eu`, or an explicit `https://` URL for a test server. ZeroBounce serves the main API from `api`, `api-us` and `api-eu`; the SDK has always supported all three, but this server had no way to reach anything but the default. There is no regional bulk or warmup host, so those calls are unaffected.
- The `zerobounce://config` resource now reports the base URL actually in use. It previously returned a hard-coded `https://api.zerobounce.net/v2` whatever the server was pointed at.

### Changed

- `validate_s3_file` and `score_s3_file` now require `returnUrl`. The API refuses a job without a callback URL, so a job submitted without one could never be created or reported back.
- `export_s3_file` no longer requires `exportBucket`. The spec makes it optional: without a bucket the API exports to the output bucket configured on your account.

### Fixed

- `validate_s3_file` and `score_s3_file` could not run against the live API at all. Neither tool exposed `returnUrl`, so none was ever sent and every job came back `400 Provided return URL is not permitted: None`. Both now take a `returnUrl` and send it.
- A `returnUrl` given to any S3 or SFTP job is checked by the same callback-URL validator as the CSV upload path, so a job is never created with a callback pointing at a private, loopback or non-HTTPS address.
- HTTP mode accepts a bulk `fileContent` up to 32 MiB. The transport previously stopped at 4 MiB, so a larger file never reached the file-size check.

### Security

- HTTP mode requires `MCP_TLS_TERMINATED=true` before binding outside loopback, making the trusted TLS proxy requirement explicit.
- Authorization bearer tokens are parsed without a backtracking regular expression, so a long header cannot stall the server.
- `returnUrl` now rejects bracketed IPv6 loopback, link-local (`fe80::/10`), unique-local, unspecified, and IPv4-mapped private addresses. Public IPv6 literals are allowed.

## [0.2.0] - 2026-10-19

This is a minor release because HTTP mode now binds to `127.0.0.1` by default, which breaks
hosted deployments that relied on the old all-interfaces default (see **Changed**).

### Added

- `score_email` tool for real-time AI scoring of a single address (`/v2/scoring`).
- `validate_email` options: `timeout`, `activityData`, `verifyPlus`, and `usePost` (form-encoded `POST /validate`).
- `validate_batch` options: `timeout`, `activityData`, and `verifyPlus`.
- Bulk email finder and bulk domain search file tools (`*_send_file`, `*_file_status`, `*_get_file`, `*_delete_file`).
- List evaluator tools: `list_evaluator_send_file` and `list_evaluator_result`.
- Custom filter tools: `add_filter`, `list_filters`, and `delete_filter`.
- S3 bulk tools: `list_s3_files`, `validate_s3_file`, `score_s3_file`, and `export_s3_file`.
- `--host` flag for HTTP mode, alongside the `MCP_HOST` environment variable.
- Offline HTTP-mode test suite (`test-http.js`), run by `npm test`.

### Changed

- HTTP mode binds to `127.0.0.1` by default. Hosted deployments must pass `--host 0.0.0.0`
  (or set `MCP_HOST=0.0.0.0`) to accept outside connections.
- Tools are only listed when the installed `@zerobounce/zero-bounce-sdk` implements the methods
  they need. `score_email` and the bulk finder, bulk domain search, list evaluator, filter, and S3
  tools require an SDK release newer than 2.1.11 and are hidden until one is installed.
- Bump `@zerobounce/zero-bounce-sdk` to `^2.1.11`.

### Fixed

- The server reports its real package version in `serverInfo` instead of `0.1.0`.
- Bulk `*_get_file` tools no longer return a full HTML error page (about 1.4 MB from the live API)
  as the error message, and an HTML page returned with status 200 is reported as an error instead of CSV.
- `validate_batch` reports account-level failures, such as an invalid API key or no credits, as
  errors instead of successful results. Per-address errors still come back in a successful result.
- `validate_batch` honours `emailAddressColumn`: each entry is read as a CSV row and the email is
  taken from that 0-based column. It was previously ignored.
- Error messages carry a single `Error:` prefix instead of `Error: Error: [Error]: …`, and long
  error bodies are truncated.

### Security

- Bulk `returnUrl` callbacks must use HTTPS and may not target private, link-local, or loopback addresses.
- Bulk `fileContent` uploads are capped at 32 MB.

## [0.1.12] - 2026-10-17

### Added

- Streamable HTTP mode (`--http` or `MCP_TRANSPORT=http`) serving `POST /mcp` and `GET /health`
  on `--port`/`PORT` (default `3000`). Each request supplies its own ZeroBounce key via
  `X-ZeroBounce-Api-Key` or `Authorization: Bearer`; there is no fallback to a shared key.
- Hosted-server setup instructions for Cursor, VS Code, and other clients, including the
  `mcp-remote` bridge for clients that only launch local commands.
- `destructiveHint` annotation on the bulk `*_delete_file` tools.

### Changed

- The bulk `returnUrl` description warns that only trusted callback URLs should be used.
- Publishing runs from a validated tag via workflow dispatch; Dependabot opens grouped security updates weekly.

## [0.1.11] - 2026-10-16

### Added

- `server.json` metadata for the MCP Registry (`io.github.zerobounce/zerobounce-mcp`).

### Changed

- License the project under Apache-2.0.
- Refresh dependencies to clear npm audit findings.

## [0.1.10] - 2026-08-18

### Added

- Documentation for supplying the API key through a client `env` block, and a warning that
  unresolved `${ZEROBOUNCE_API_KEY}` references reach the server as a literal key.

## [0.1.9] - 2026-08-18

### Added

- Read the API key from the `ZEROBOUNCE_API_KEY` environment variable when `--api-key` is not given.

### Fixed

- `--api-key=<value>` no longer truncates keys that contain `=`.

### Security

- Clear outstanding npm audit findings.

## [0.1.8] - 2026-06-18

### Changed

- Bump `@zerobounce/zero-bounce-sdk` to 2.1.9.

### Security

- Clear npm audit findings.

## [0.1.7] - 2026-06-11

### Changed

- Bump `@zerobounce/zero-bounce-sdk` to 2.1.7 and `@modelcontextprotocol/sdk` to 1.29.0.

### Security

- Resolve all reported npm audit vulnerabilities; publishing now requires a clean audit.

## [0.1.6] - 2026-06-11

### Changed

- Use the `@zerobounce/zero-bounce-sdk` 2.1.6 APIs for email finder, domain search, and bulk file uploads.
- Bulk tools accept 0-based column indexes and translate them to the SDK's 1-based indexes.

## [0.1.5] - 2026-06-11

### Changed

- The publish workflow no longer runs live API tests.

## [0.1.4] - 2026-06-11

### Fixed

- Bulk `*_get_file` tools work in Node and return CSV results in a form MCP clients can read.

### Changed

- Publish to npm with trusted publishing (OIDC).

## 0.1.3 - 2025-12-10

### Changed

- Update the documentation for installing from npm.

### Security

- Update `@modelcontextprotocol/sdk` to fix a reported vulnerability.

## 0.1.0 - 2025-11-27

### Added

- Initial release: stdio MCP server with email validation, batch validation, credits and API
  usage, bulk validation and AI scoring files, email finder, domain search, and activity data tools.

[Unreleased]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.12...v0.2.0
[0.1.12]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/zerobounce/zerobounce-mcp/releases/tag/v0.1.4
