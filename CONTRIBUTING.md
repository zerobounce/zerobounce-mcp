# Contributing to the ZeroBounce MCP Server

Thanks for your interest in improving this project.

## Code of Conduct

By participating you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

```bash
npm ci
npm run typecheck   # esbuild does not typecheck, so run this separately
npm run lint
npm run build
npm test            # the offline suite, against a fake API
```

`npm test` runs offline and needs no credentials. The live suite is separate:

```bash
npm run test:live -- --api-key="$ZEROBOUNCE_API_KEY"
```

Do not run the live suite with a placeholder key. ZeroBounce sits behind Cloudflare, which answers a bogus key — or a bogus resource id — with a `403 error code: 1020` page rather than the API's own JSON, so the suite fails on the block instead of testing anything. See `AGENTS.md`.

## How to Contribute

### Reporting Bugs

Open an issue describing what you expected, what happened, and how to reproduce it. Never paste an API key into an issue.

### Suggesting Changes

Open an issue first for anything that changes a tool's name, arguments or behaviour — those are a public interface for every MCP client.

### Submitting Changes

1. Branch from `main`.
2. Add or update tests in `test-http.js`, asserting the request method, full URL, parameters and where the key travels, plus the response and error parsing.
3. Rebuild and commit `dist/index.js` — the repository ships the bundle.
4. Only add tools for endpoints documented at <https://www.zerobounce.net/docs/>.
5. Make sure `npm run typecheck`, `npm run build` and `npm test` all pass.
6. Update `CHANGELOG.md` and the README.

`AGENTS.md` carries the conventions in more detail, including the argument-helper rule and the 0-based column indexes.

## Questions

Email <integrations@zerobounce.net>.
