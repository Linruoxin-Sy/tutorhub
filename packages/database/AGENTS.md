# AGENTS.md

This package owns Prisma schema, generated client artifacts, and database commands.

## Package Basics

- Use the package scripts for migrations and generation rather than calling Prisma ad hoc.
- Keep schema changes confined to `prisma/` and the package source that consumes generated artifacts.
- Treat generated files as derived output unless the task explicitly requires regenerating them.

## Validation

- Use the matching package script for the task, for example `pnpm --filter @tutorhub/database db:generate`, `db:migrate`, `db:deploy`, or `db:studio`.
- For schema edits, validate with the relevant database command instead of a broad repo build when possible.
