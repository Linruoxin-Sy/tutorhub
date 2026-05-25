# AGENTS.md

This package provides shared Vite configuration helpers.

## Package Basics

- Keep the package focused on reusable configuration and avoid app-specific logic.
- Preserve the existing `src/vite/index.ts` export surface unless a change requires expanding it.

## Validation

- Prefer package-scoped checks such as `pnpm --filter @tutorhub/config build` when applicable.
- Use the smallest check that validates config changes in the consuming package.
