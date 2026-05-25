# AGENTS.md

This repository is a pnpm monorepo for TutorHub. Keep this file limited to repo-wide rules that apply across packages.

## Monorepo Basics

- Use Node.js >= 24.9.0 and pnpm >= 10.15.0.
- Prefer workspace-scoped commands when a change only touches one package, for example `pnpm --filter @tutorhub/web build`.
- Preserve package boundaries and reuse workspace packages instead of duplicating helpers.
- Keep TypeScript ESM-compatible; the repo is configured with `type: module`.
- Do not rewrite unrelated files or formatting unless the task requires it.

## Validation

- Use the narrowest check that matches the change: `pnpm test`, `pnpm eslint`, `pnpm build`, or a package-specific command.
- If you change tests, keep them under `**/tests/**/*.test.ts` or `**/tests/**/*.spec.ts` so Vitest picks them up.

## Package Guidance

- Read the nearest AGENTS.md in the package you are editing for package-specific rules and commands.
- When coding inside a specific package, read that package's AGENTS.md before making changes.
- `apps/web` also has page-generation guidance in [apps-web-page-generation.instructions.md](.github/instructions/apps-web-page-generation.instructions.md).

## Helpful Links

- Root scripts and package manager details: [package.json](package.json)
- Test project wiring: [vitest.config.ts](vitest.config.ts)
- Shared test include rules: [tsconfig.test.json](tsconfig.test.json)
- Workspace build orchestration: [turbo.json](turbo.json)
