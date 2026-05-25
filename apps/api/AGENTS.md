# AGENTS.md

This package is the TutorHub API. Keep guidance here focused on the service entrypoint and build commands.

## App Basics

- Stack: Hono-based API entrypoint, built with `tsdown` and run in watch mode via `tsx`.
- Keep the package ESM-compatible and preserve the existing `src/index.ts` entrypoint structure.

## Validation

- Prefer package-scoped checks such as `pnpm --filter @tutorhub/api build` or `pnpm --filter @tutorhub/api dev`.
- When changing request handling or RPC surface files, run the narrowest build or type-check command that exercises the entrypoint.
