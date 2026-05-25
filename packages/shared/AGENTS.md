# AGENTS.md

This package is the shared library used by other workspace packages.

## Package Basics

- Keep exports small and reusable; avoid coupling the package to app-specific concerns.
- Preserve the existing Vite-based package structure and shared-test conventions.

## Validation

- Prefer package-scoped checks such as `pnpm --filter @tutorhub/shared build`.
- If you add tests, keep them under `tests/` with Vitest-compatible names.
