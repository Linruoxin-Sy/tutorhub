# AGENTS.md

This package is the TutorHub web app. Keep guidance here focused on app-level structure and commands.

## App Basics

- Stack: Vue 3, Vite, Tailwind v4, Pinia, Vue Router, and Vue TSC type checking.
- Follow the existing feature-folder structure under `src/features/*`, keep `src/components` for reusable generic components, and keep `src/ui` for stateless presentational components.
- For page generation or page-level UI in this app, follow [apps-web-page-generation.instructions.md](../../.github/instructions/apps-web-page-generation.instructions.md).
- The app uses Vue Router file-based routing.
- The app is configured with unplugin-auto-import and unplugin-vue-components, so common Vue, router, and Pinia APIs plus shared components are available without manual import statements.
- When generating page code, avoid adding imports for APIs or components that are already covered by the auto-import and auto-components setup.
- Reuse shared generic components from `src/components` before creating new page-specific variants, and only place static display-only pieces in `src/ui`.
- Keep page-level Vue code simple and explicit. The repo currently favors direct templates over elaborate abstraction.

## Directory Structure

- `components`: All shared components that are used across the entire application.
- `hooks`: All shared composables.
- `config`: Application configuration files.
- `features`: Contains all the application features. We want to keep most of the application code inside here. More on this later.
- `layouts`: Different layouts for the pages.
- `lib`: Configurations for different third-party libraries that are used in our application.
- `pages`: The pages of our application.
- `services`: Shared application services and providers.
- `stores`: Global state stores.
- `test`: Test-related mocks, helpers, utilities, and configurations.
- `types`: Shared TypeScript type definitions.
- `utils`: Shared utility functions.

## Validation

- Prefer package-scoped checks such as `pnpm --filter @tutorhub/web build` or `pnpm --filter @tutorhub/web dev`.
- Use the smallest check that covers the touched slice, and run type checking when you touch routed views or shared UI.
