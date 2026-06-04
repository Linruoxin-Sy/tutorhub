---
description: 'Use when generating or editing pages and page-level layouts in apps/web.'
applyTo: 'apps/web/src/App.vue,apps/web/src/features/**/pages/**/*.vue,apps/web/src/layouts/**/*.vue'
---

# apps/web page generation

Use this file for page generation inside `apps/web`. Keep generated layouts aligned with the existing dashboard language instead of introducing a new visual system.

## Visual Direction

- Use a restrained dashboard style: gray backgrounds, white or near-black panels, and minimal decorative noise.
- Keep geometry soft and rounded. Prefer pill-shaped controls, circular avatars, rounded cards, and small shadows.
- Preserve the current dark mode split: light mode stays neutral and airy, dark mode moves to charcoal and near-black surfaces.
- Default to functional typography: bold brand/title text, medium-weight labels, and simple gray text tokens.

## Layout Pattern

- Blayoutsld pages inside the existing shell from [apps/web/src/layouts/AppLayout.vue](../../apps/web/src/layouts/AppLayout.vue) and [apps/web/src/layouts/AppHeader.vue](../../apps/web/src/layouts/AppHeader.vue).
- Keep the header compact and stable; avoid introducing new top-level chrome unless the task explicitly needs it.
- Use card-like content blocks with consistent padding, rounded corners, and thin borders for page sections.
- Prefer a clear content hierarchy over dense dashboards. If a page has multiple sections, separate them with spacing and light surface contrast.

## Navigation And Controls

- Reuse the capsule navigation pattern from [apps/web/src/layouts/AppNavBar.vue](../../apps/web/src/layouts/AppNavBar.vue): icon plus label, muted inactive states, and a stronger active chip.
- Keep interactive controls compact and visually calm. Theme toggles and similar tools should read as small icon buttons inside rounded containers.
- When adding actions, use existing icon utilities and restrained emphasis instead of large bespoke buttons.

## Component Patterns

- Favor Tailwind utility classes already used in the app: gray surfaces, `dark:*` variants, rounded-full shapes, small shadows, ring outlines, and compact spacing.

## What To Avoid

- Do not introduce a new color system, font system, or highly saturated accent palette without a clear product reason.
- Do not replace the current shell layout with a different app frame.
- Do not add heavy gradients, large decorative illustrations, or dense glassmorphism effects.
- Do not overcomplicate page structure when the existing pattern already supports the content.
