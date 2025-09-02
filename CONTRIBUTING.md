# Contributing to nanobanana-rules

Thanks for your interest! Quick guide:

- Requirements: Node 18+ (recommended 20), npm
- Install: `npm ci`
- Build: `npm run build`
- Run (stdio): `npm start`
- Style: Keep code simple, TypeScript strict, no unrelated refactors
- Commits: Small, clear messages
- PRs: Describe intent and testing. Link issue if exists

## Development notes

- Avoid long-lived caches. If adding cache, keep TTL short (<=120s)
- Network failures should surface clear error messages to MCP clients
- Keep README up to date when adding new tool args or behavior

## Releases

- Tag format: `v0.1.0`
- Consider semantic versioning for breaking changes
