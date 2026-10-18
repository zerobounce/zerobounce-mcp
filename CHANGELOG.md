# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
