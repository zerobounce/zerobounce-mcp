# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking changes

- Bundled ZeroBounce SDK 5.0.0 (was 4.0.0). Behaviour a 0.3.1 user can notice through the tools:
  a 2xx body that carries only a `message`, a `success` flag that is not true (`false`, `0`,
  `"0"`, `" False "`, `null`) or no data at all (`{}`, an unrecognised object) is now an error
  instead of a successful result; `get_credits` returns `Credits` as a string when the API sends
  one; a validation timeout that is not a whole number of seconds in the allowed range (for
  example `4.5`) is refused; a bulk download that starts with `<` is an error, not CSV; and
  transport failures read as the SDK's status-0 error text.
- Inputs the server now refuses before any request: CR, LF or NUL in `fileName` or `returnUrl`, an email over 320 characters, more than 200 emails in `validate_batch`, and `get_api_usage` dates that are not real `YYYY-MM-DD` dates or whose start is after the end.
- Optional string arguments are type-checked like the number and boolean ones since 0.3.0. A
  value that is set but is not a string, such as `ipAddress: 123` on `validate_email` or
  `domain: 123` on `find_email`, is now an error ("ipAddress must be a string") where 0.3.1
  silently left it out. `validate_batch` refuses an `emails` list with an item that is not a
  non-empty string ("emails must contain only non-empty strings"); 0.3.1 sent `[1, 2]` to the
  API as numbers. An empty string still counts as not set.
- HTTP mode checks the `Host` header: only the bound host (loopback names for a loopback bind) and names given with `--allowed-host` or `MCP_ALLOWED_HOSTS` (comma-separated) are served on `/mcp`; a foreign or missing Host, or a cross-origin `Origin` (including `Origin: null`), gets 403. A wildcard bind (`0.0.0.0`) with no allowed host keeps accepting any Host and logs a warning; set `MCP_ALLOWED_HOSTS` to your public name. `/health` is not checked.
- HTTP mode refuses (400) a repeated `X-ZeroBounce-Api-Key`, `X-ZeroBounce-Warmup-Api-Key` or `Authorization` header, and an `X-ZeroBounce-Api-Key` that differs from the Bearer token.
- `returnUrl` and `webhookUrl` are refused when they contain control, whitespace, invisible characters or a backslash, a username or password, or a port other than 443; they are also refused for the full RFC 6890 special-purpose IPv4 and IPv6 ranges (including IPv6 forms that embed an IPv4 address: mapped, compatible, NAT64, 6to4), `localhost.`, `*.local`, `*.internal`, `*.nip.io`-style names and cloud metadata names. The normalised URL (lower-case host, no trailing dot) is what is forwarded. DNS is not resolved: ZeroBounce makes the callback.
- Column indexes (`emailAddressColumn`, `domainColumn`, name, gender, IP columns, list evaluator, `validate_batch`) must be whole numbers from 0 to 999; `validate_batch` takes at most 200 emails; an email is at most 320 characters; `get_api_usage` dates must be real `YYYY-MM-DD` dates with `startDate` not after `endDate`; CR/LF/NUL in `fileName` is refused before the SDK.

### Added

- `hasHeaderRow` on all four bulk `*_send_file` tools, `removeDuplicate` on
  `bulk_validate_send_file` and `bulk_ai_scoring_send_file`, and `firstNameColumn`,
  `lastNameColumn`, `genderColumn`, `ipAddressColumn` (0-based, like the other column
  arguments) and `allowPhase2` on `bulk_validate_send_file`. Each is parsed strictly; a
  `hasHeaderRow` that is not a boolean is an error before any request. Left out,
  `has_header_row` and `remove_duplicate` are still sent as `false`, as in 0.3.1: the JS
  SDK always sends `remove_duplicate`, with its released default of `false`.
- `--allowed-host <name>` (repeatable) and `MCP_ALLOWED_HOSTS` for public HTTP binds.

### Changed

- `@modelcontextprotocol/sdk` is required at `^1.32.1` (was `^1.29.0`); 1.29 to 1.31 carry published advisories, two of them on request size limits in the HTTP transport this server uses. `@types/node` follows the `engines` floor (22).
- `--help` / `-h` and `--version` / `-v` print and exit without a key. An unknown option or a stray argument now stops the server with `Unknown argument: ...` (and a flag followed by another flag is a missing value) instead of being ignored: `--api-ky` used to start the server with the key from the environment.
- Client setup docs follow each client's current format: VS Code `mcp.json` uses `servers` and has MCP built in (no extension), Cursor reads `~/.cursor/mcp.json`, Zed uses `context_servers`, Continue uses `.continue/mcpServers/*.yaml`. `server.json` declares the optional `ZEROBOUNCE_WARMUP_API_KEY` (secret) and `ZEROBOUNCE_API_URL`.
- Publishing: the publish workflow tests the tag, packs it once, and publishes that exact tarball with provenance (no second build). The GitHub release needs only tag validation and the tests, and a `skip_npm` input skips the npm step. Every job uses the validated tag commit; the lockfile and every `server.json` version are checked and a missing one fails. `npm audit` gates on the shipped dependencies only; CI also runs lint and fails if the committed `dist/index.js` is stale. npm is pinned to an exact version; jobs have timeouts and concurrency groups.
- `@zerobounce/zero-bounce-sdk` is a development dependency. `dist/index.js` bundles it, and
  nothing loads it at run time, so `npm install @zerobounce/mcp` no longer installs an unused
  copy. Which SDK version a release carries is set by the lockfile when it is built.

### Security

- A base URL with a username, a password, a query, or a fragment is refused before the server starts. The error does not include the URL. `zerobounce://config` therefore cannot return a credential that was embedded in the URL.
- An API key that contains a control character, an invisible character, or Unicode whitespace is refused. An ordinary space in the middle of the key is still allowed.
- Every tool result (success and error, all content text) now gets a final masking pass with every secret of the call: the API key (also the Inbox Placement key), the Warmup key, and any SMTP username/password or token in the tool arguments. The masking is vendored from @zerobounce/zero-bounce-sdk 5.0.0 (`src/security/redact.ts`): case and Unicode folding (Turkish i, combining marks), `%XX`/`%25`, `\u`/`\U`/`\x`/octal and HTML-entity spellings, a 64 KiB per-window cap, linear time; long text is masked in windows. Before, the server added no masking of its own: a 400 body, a 200 `{"error"}` body, an HTML `<title>`, a transport error or a plain success body that echoed the key came back to the model verbatim.
- `validate_batch`: the account-level error (`email_address` "all", HTTP 200) thrown by the server itself is masked with every secret (it bypassed the SDK); the match is now case-insensitive, as in the SDK.
- Text from a bulk `get_file` JSON/other body is masked before it is thrown.
- A short secret (under 8 characters, e.g. a short SMTP username) is masked in a whole result only as a whole token, so it no longer cuts letters out of fixed words ("ZeroBo***nce ret***rned"); text taken from a response body is masked with every secret however short.
- A request target that does not parse (`GET //[ HTTP/1.1`) crashed the HTTP server process; it is now answered 400, and the request handler is wrapped so no request can throw out of it.
- DNS-rebinding protection for HTTP mode (Host and Origin checks, above).
- The API key and Warmup key check covers every invisible, format, bidi, C1 and lone-surrogate character and a key of combining marks only (as JavaScript SDK 5.0.0 `checkApiKey`).
- HTTP server limits: headers within 15 s, a whole request within 120 s, at most 512 connections.

### Fixed

- The descriptions of the `bulk_email_finder_*` and `bulk_domain_search_*` tools read "bulk bulk email finder" / "bulk bulk domain search" in 0.3.1; they now say "bulk email finder" and "bulk domain search".
- Bulk get-file treats an HTML page as an error when spaces, tabs, a BOM, or U+00A0 come before `<html`. A download whose first non-space character is `<` is refused as an HTML page, as in SDK 5.0.0 (a CSV never starts with `<`); a file that merely begins with spaces is still returned.
- `list_filters` reads `usePost` with the same strict boolean rules as the other tools. The string `"false"` is no longer sent as POST.
- The API key is no longer a property of the MCP's own client objects. `ZeroBounceClient`
  kept it in an ordinary `apiKey` property, and the server kept the whole config, so
  `JSON.stringify`, `util.inspect` and `%o` of those objects printed it. Both now hold only
  what they need (the key sits in a private field; the server keeps just whether each key is
  set, which the `zerobounce://config` resource still reports). The ZeroBounce SDK that
  `dist/index.js` bundles keeps its own copy of the key; SDK 5.0.0 (below) closes that copy.
- `delete_inbox_placement_test` reports a 2xx whose body is only whitespace as an error
  with its status. 0.3.1 read any body the bundled SDK called empty (`"   "` included) as a
  completed delete; only a body of zero bytes (the documented 204, or an empty 200) is one.
- `bulk_email_finder_send_file` and `bulk_domain_search_send_file` no longer advertise a
  `returnUrl` argument. Those endpoints take no `return_url`, and 0.3.1 accepted the
  argument and dropped it without saying so.
- An error message longer than 1000 characters is cut at a character boundary. 0.3.1 cut at
  1000 UTF-16 units, so an emoji or other character outside the Basic Multilingual Plane at
  that point was split, leaving half a surrogate pair (U+FFFD once encoded as UTF-8).
- The `dist/index.js` committed at the v0.3.1 tag reported version 0.3.0 in `serverInfo`,
  because the release commit did not rebuild it. The npm package was rebuilt at publish time
  and reports 0.3.1. The test suite now checks both the built and the committed bundle.
- An error whose body is JSON (starts with `{` or `[`) is never reported as an "HTML error page", whatever a string inside it says; the HTML `<title>` is taken after masking, only from non-JSON bodies, and is dropped if over 1000 characters.
- A bulk file download that starts with `<` (after spaces, tabs, a BOM or U+00A0) is an error ("ZeroBounce returned an HTML page instead of a file."), as in the SDK 5.0.0; v0.3.1 returned `<title>Access denied</title>` as CSV.
- `get_credits`: the result type is the SDK 5.0.0's `Credits` string (`"Credits": "2375323"`), not a number.
- `delete_inbox_placement_test`: the server no longer wraps global `fetch` to detect a 204; the SDK 5.0.0 resolves an empty 2xx to `{}` itself (a whitespace-only body is still an error).
- A tool that throws is reported as a masked tool error, never a raw exception message.

## [0.3.1] - 2026-11-12

### Changed

- Bundles `@zerobounce/zero-bounce-sdk` 4.0.0 (was 3.1.0). Through it, the tools now treat any 2xx `error` / `error_message` / `Error` body as an error (not only key and credit messages), the bulk `*_get_file` tools reject JSON error bodies from the SDK itself, boolean options are sent strictly, and the API key is no longer enumerable on the SDK client. 0.3.0 was released with 3.1.0 because the two were published at the same time.

## [0.3.0] - 2026-11-12

### Breaking changes

- Optional number and boolean tool arguments are parsed strictly instead of being dropped when
  they are not the expected type. A number may be given as a number or a numeric string
  (`"10"`); anything else, such as `timeout: "abc"`, is now an error ("timeout must be a
  number") where 0.2.0 silently left the argument out. A boolean may be `true` / `false`,
  `"true"` / `"false"` in any case, or `1` / `0`; anything else, such as
  `activityData: "yes"`, is now an error ("activityData must be true or false"). In 0.2.0 every
  string, including `"true"` and `"false"`, was dropped, so `activityData: "true"` sent no
  `activity_data`; it is now sent as `true`. An empty string still counts as not set.
- `bulk_email_finder_send_file` requires `firstNameColumn` or `fullNameColumn` and refuses a
  call without either before any request ("firstNameColumn or fullNameColumn is required for
  the bulk email finder"). The API already refused such a file.

### Added

- `bulk_email_finder_send_file` takes `fullNameColumn` (0-based, like the other columns) for a
  file with one full-name column instead of first and last names.

### Fixed

- A dead or invalid API key is reported as an error (`isError: true`, "Invalid API key or your
  account ran out of credits") by `find_email`, `domain_search`, `list_filters`, `add_filter`
  and `delete_filter`. 0.2.0 bundled `@zerobounce/zero-bounce-sdk` 3.0.0, which resolved the
  API's HTTP 200 answer for a dead key on these calls, so the tools reported it as a successful
  result. The server now bundles 3.1.0 (`^3.1.0` in `package.json`, 3.1.0 in the lockfile).

## [0.2.0] - 2026-11-11

This release adds 60 tools (49 are advertised without a Warmup key, 75 with one, up from 15
in 0.1.12) and contains breaking changes for anyone running on Node.js 18 or 20, and for
hosted HTTP deployments.

### Breaking changes

- Requires Node.js 22 or later. `engines` previously allowed Node.js 18 (`>=18.0.0`); Node.js 18
  and 20 are both end of life. CI tests on Node.js 22 and 24.
- HTTP mode binds to `127.0.0.1` by default instead of all interfaces. A hosted deployment must
  pass `--host 0.0.0.0` (or set `MCP_HOST=0.0.0.0`) to accept outside connections.
- HTTP mode refuses to bind anything but loopback unless `MCP_TLS_TERMINATED=true` is set, making
  the trusted TLS-terminating proxy an explicit requirement. A deployment that only adds
  `--host 0.0.0.0` exits at startup with `Non-loopback HTTP binding requires MCP_TLS_TERMINATED=true`.

### Added

- `score_email` tool for real-time AI scoring of a single address (`/v2/scoring`).
- `validate_email` options: `timeout`, `activityData`, `verifyPlus`, and `usePost` (form-encoded `POST /validate`).
- `validate_batch` options: `timeout`, `activityData`, and `verifyPlus`.
- Bulk email finder and bulk domain search file tools (`*_send_file`, `*_file_status`, `*_get_file`, `*_delete_file`).
- List Evaluator tools: `list_evaluator_send_file`, `list_evaluator_result`, and
  `send_evaluated_file`. `send_evaluated_file` submits a finished evaluation for bulk validation
  and takes the evaluator's `fileId`, not a file upload: the public docs describe an upload,
  which the API rejects with "file_id: This field is required".
- Custom filter tools: `add_filter`, `list_filters`, and `delete_filter`.
- S3 bulk tools: `list_s3_files`, `validate_s3_file`, `score_s3_file`, `email_finder_s3_file`,
  `domain_search_s3_file`, and `export_s3_file`. The job tools require a `returnUrl` (the API
  refuses a job without one) and take optional `hasHeaderRow` and `removeDuplicates`.
  `export_s3_file` takes an optional `exportBucket`; without it the API exports to the output
  bucket configured on your account.
- SFTP/FTP bulk tools: `validate_sftp_file`, `score_sftp_file`, `email_finder_sftp_file`,
  `domain_search_sftp_file`, and `export_sftp_file`, with the same arguments as the S3 jobs. The
  server, path and protocol come from your ZeroBounce account settings. `export_sftp_file` takes
  an optional `exportPath` -- a path, not a bucket.
- Inbox Placement Tester tools, covering all eight documented operations:
  `get_inbox_placement_providers`, `get_inbox_placement_test_types`,
  `create_inbox_placement_test`, `get_inbox_placement_test`, `list_inbox_placement_tests`,
  `delete_inbox_placement_test`, `get_inbox_placement_webhook`, and
  `set_inbox_placement_webhook`. They report where a campaign actually landed -- inbox, spam,
  or nowhere -- per mailbox provider.
- 26 ZeroBounce Warmup tools, covering every documented Warmup operation: `warmup_list_sending_accounts`, `warmup_get_sending_account`, `warmup_add_sending_account`, `warmup_update_sending_account`, `warmup_delete_sending_account`, `warmup_change_from_address`, `warmup_list_from_addresses`, `warmup_get_engagement_rules`, `warmup_set_engagement_rule`, `warmup_get_custom_engagement`, `warmup_create_custom_engagement`, `warmup_update_custom_engagement`, `warmup_delete_custom_engagement`, `warmup_get_seeds`, `warmup_download_seeds`, `warmup_get_seed_count`, `warmup_get_progress_today`, `warmup_get_sent_today`, `warmup_get_emails_per_day`, `warmup_get_statistics`, `warmup_get_statistics_per_day`, `warmup_get_statistics_detailed`, `warmup_download_statistics`, `warmup_get_from_address_statistics`, `warmup_check_domain_dmarc` and `warmup_test_smtp_configuration`. `warmup_download_seeds` and `warmup_download_statistics` return the API's CSV as text rather than wrapping it in JSON.
- `--warmup-api-key` and `ZEROBOUNCE_WARMUP_API_KEY` supply the Warmup API key in stdio mode.
  Warmup is a separate product with a separate key and host, so the main `ZEROBOUNCE_API_KEY`
  does not work there. Without a Warmup key the 26 Warmup tools are not advertised at all, so a
  client never sees a tool it cannot use.
- HTTP mode reads the Warmup key from a per-request `X-ZeroBounce-Warmup-Api-Key` header,
  alongside `X-ZeroBounce-Api-Key`. Like the validation key it is never taken from the server
  environment and never shared between requests.
- `--warmup-url` and `ZEROBOUNCE_WARMUP_API_URL` point the Warmup client at a test host. Only an
  explicit `https://` URL is accepted: there is no regional Warmup host, so `us` and `eu` are
  refused rather than quietly ignored.
- `--url` and `ZEROBOUNCE_API_URL` select the main API host: `us`, `eu`, or an explicit
  `https://` URL for a test server. A non-https or malformed URL is refused. There is no regional
  bulk or Warmup host, so those calls are unaffected.
- The `zerobounce://config` resource reports the main API base URL actually in use (it was a
  fixed `https://api.zerobounce.net/v2`), plus `warmupBaseUrl` and whether a Warmup key is
  configured.
- `--host` flag and `MCP_HOST` environment variable choose the HTTP listen address.

### Changed

- Relicensed from Apache-2.0 to MIT, the license every ZeroBounce SDK uses. The `LICENSE` file
  and the `license` field in `package.json` both say MIT.
- `@zerobounce/zero-bounce-sdk` moves from `^2.1.9` to `^3.0.0`. A tool whose SDK method is
  missing from the installed SDK is not advertised, so the server never lists a tool it cannot run.
- `npm test` runs the offline test suite (`test-http.js`, against a fake API, no key needed)
  instead of the live-API stdio test. The live test is now `npm run test:live`.
- The publish workflow runs the test suite, checks that `server.json` carries the package
  version, and pins npm to major version 11 for trusted publishing instead of `npm@latest`.

### Fixed

- The server reports its real package version in `serverInfo` instead of `0.1.0`.
- Bulk `*_get_file` tools no longer return a full HTML error page as the error message, and an
  HTML page returned with status 200 is reported as an error instead of CSV.
- `validate_batch` reports account-level failures, such as an invalid API key or no credits, as
  errors instead of successful results. Per-address errors still come back in a successful result.
- `validate_batch` honours `emailAddressColumn`: each entry is read as a CSV row and the email is
  taken from that 0-based column. It was previously ignored.
- Error messages carry a single `Error:` prefix instead of `Error: Error: [Error]: …`, and error
  messages longer than 1000 characters are truncated.
- README: the "Limitations and Non-Supported Endpoints" section, which said custom filters and the
  List Evaluator were unavailable, is gone; the tool error format, the `status` list (`catch-all`,
  not `catchall`) and the `sub_status` list (which named eleven values the API does not
  return and missed thirteen it does) now match the API; and Node.js 22 is stated as a requirement.

### Security

- A bulk `returnUrl` must use HTTPS and may not target a private, link-local, loopback,
  unspecified, or unique-local address, including bracketed IPv6 and IPv4-mapped forms. The same
  check applies to the CSV upload tools, every S3 and SFTP job, and the Inbox Placement
  `webhookUrl`, so a job is never created with a callback pointing inside your network.
- Bulk `fileContent` is capped at 32 MiB. HTTP mode accepts a request large enough to carry
  that; the transport's default limit of 4 MiB previously rejected a larger file before it
  reached the size check.
- The `Authorization: Bearer` header is parsed without a regular expression, so a long header
  cannot cause polynomial backtracking.

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

[Unreleased]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/zerobounce/zerobounce-mcp/compare/v0.2.0...v0.3.0
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
