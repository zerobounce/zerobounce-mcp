# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

`@zerobounce/mcp` is a Model Context Protocol server for the ZeroBounce email validation API,
written in TypeScript on `@modelcontextprotocol/sdk` and the official
`@zerobounce/zero-bounce-sdk`. It runs over two transports:

- **stdio** (default): one user, API key from `--api-key` or `ZEROBOUNCE_API_KEY`.
- **Streamable HTTP** (`--http` or `MCP_TRANSPORT=http`): stateless `POST /mcp` plus `GET /health`.
  Every request carries its caller's key in `X-ZeroBounce-Api-Key` or `Authorization: Bearer`.

## Layout

- `src/index.ts`: CLI parsing, the MCP server, and both transports.
- `src/zerobounce-client.ts`: wrapper around the ZeroBounce SDK, one instance per API key.
- `src/tools/`: one file per tool or tool family, registered in `src/tools/index.ts`.
- `src/security/`: input validation for bulk uploads and callback URLs.
- `test-mcp.js`: stdio test against the live API.
- `test-http.js` and `test/fake-zerobounce-api.mjs`: offline HTTP test against a fake API.
- `dist/index.js`: committed esbuild bundle (see below).

## Commands

```bash
npm ci
npm run typecheck   # esbuild does not typecheck, so run this separately
npm run lint
npm run build
npm test            # stdio test (live API, TEST_KEY by default), then the offline HTTP test
```

## Conventions

- **Rebuild and commit `dist/index.js`** with every source change. The repository ships the bundle.
- **Tool argument helpers take a value, not the args object.** Write `requireString(args.email, 'email')`,
  never `requireString(args, 'email')`. The wrong form compiles but rejects every call.
- **Tools that need newer SDK methods** must list them in `sdkMethods`. `getAllTools()` hides a
  tool when the installed SDK lacks any of them, so a release never advertises broken tools.
- **Never share API keys or server state across HTTP requests.** `handleMcpRequest` creates a
  fresh server and client per request, and HTTP mode deliberately ignores `ZEROBOUNCE_API_KEY`.
- **HTTP binds to `127.0.0.1` by default.** Hosted deployments opt in with `--host 0.0.0.0`.
- **Don't hard-code the server version.** `npm run build` injects `package.json`'s version as
  `__PACKAGE_VERSION__`, which the server reports in `serverInfo`.
- Bulk tool column indexes are 0-based for MCP callers; `ZeroBounceClient` converts them to the
  SDK's 1-based indexes. Treat column `0` as a real value (`!= null`, not truthiness).
- Add new tools to `TOOL_ARGS` (and `SDK_GATED` if gated) in `test-http.js`, which fails if a
  listed tool has no valid-argument case.
- Match the surrounding style: Prettier (`npm run format`) and ESLint configs are in the repo.

## Changelog

`CHANGELOG.md` follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and the
project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

- Add every user-visible change to the `## [Unreleased]` section in the same commit as the change.
- Group entries under these headings, in this order, omitting empty ones: `Added`, `Changed`,
  `Deprecated`, `Removed`, `Fixed`, `Security`.
- Write for people using the server: name the tool, flag, or setting, and say what changed.
  Leave out internal refactors, CI-only changes, and fixes to code that was never released.
- Pick the version by SemVer. While the major version is `0`, a breaking change (a removed or
  renamed tool or argument, or a changed default such as the HTTP bind host) bumps the minor
  version (`0.y.0`). New features also bump the minor version. Fixes alone bump the patch version (`0.y.z`).

## Releasing

1. Move the `[Unreleased]` entries under `## [x.y.z] - YYYY-MM-DD`, leave an empty
   `[Unreleased]` section, and update the compare links at the bottom of `CHANGELOG.md`.
2. Set the same version in `package.json`, `package-lock.json`, and both `version` fields of
   `server.json`. The publish workflow fails if they differ from the tag.
3. Rebuild `dist/index.js`, run the commands above, and commit.
4. Tag `vx.y.z` and run the publish workflow with that tag. Publishing to npm and pushing tags
   need a maintainer's explicit approval.
