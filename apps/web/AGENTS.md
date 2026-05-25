# AGENTS.md

This package is the TutorHub web app. Keep guidance here focused on app-level structure and commands.

## App Basics

- Stack: Vue 3, Vite, Tailwind v4, Pinia, Vue Router, and Vue TSC type checking.
- Follow the existing feature-folder structure under `src/features/*` and shared UI under `src/ui`.
- For page generation or page-level UI in this app, follow [apps-web-page-generation.instructions.md](../../.github/instructions/apps-web-page-generation.instructions.md).
- The app is configured with unplugin-auto-import and unplugin-vue-components, so common Vue, router, and Pinia APIs plus shared components are available without manual import statements.
- When generating page code, avoid adding imports for APIs or components that are already covered by the auto-import and auto-components setup.
- Reuse shared UI components from `src/ui` before creating new page-specific variants.
- Keep page-level Vue code simple and explicit. The repo currently favors direct templates over elaborate abstraction.

## Validation

- Prefer package-scoped checks such as `pnpm --filter @tutorhub/web build` or `pnpm --filter @tutorhub/web dev`.
- Use the smallest check that covers the touched slice, and run type checking when you touch routed views or shared UI.
