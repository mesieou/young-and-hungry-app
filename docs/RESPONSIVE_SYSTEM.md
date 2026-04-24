# Responsive System

Young & Hungry uses a mobile-first responsive system. New pages and components should start at `320px` and scale upward without requiring page-specific layout fixes.

## Breakpoints

- `base`: `0-639px`
- `sm`: `640-767px`
- `md`: `768-1023px`
- `lg`: `1024-1279px`
- `xl`: `1280px+`

Use Tailwind's default breakpoints only. Do not add route-specific breakpoints unless there is a proven layout bug that cannot be solved inside the existing scale.

## Shared Primitives

- `SiteContainer`
  Standard horizontal padding and max width.
- `PageSection`
  Standard section spacing and container width.
- `StepShell`
  Shared multistep layout with desktop sidebar, mobile accessory row, and action rail.
- `ResponsiveDrawer`
  Shared mobile drawer/sheet for nav, summaries, and other secondary surfaces.

Use these primitives before adding new wrapper divs with custom `px-*`, `max-w-*`, or sticky behavior.

## Layout Rules

- Build mobile first. Add larger breakpoint classes only after the base layout is correct.
- Default page shell:
  `PageSection` + `SiteContainer`
- Default horizontal padding:
  `px-4 sm:px-6 lg:px-8`
- Default content width:
  `max-w-7xl`
- Narrow detail pages:
  use `PageSection width="compact"` or `width="narrow"`
- Do not use fixed mobile heights for real content. Decorative media can crop; forms, cards, dialogs, and summaries should remain content-driven below `lg`.

## Grids, Cards, And Actions

- Prefer single-column stacks by default, then expand with `sm:`/`md:`/`lg:` grid classes.
- Buttons and CTA rows must stack below `sm` if labels become cramped.
- Cards containing user data must include `min-w-0` and wrapping behavior.
- Long addresses, IDs, emails, and pricing strings must use `break-words` or a safe truncation pattern.

## Navigation, Drawers, And Modals

- Desktop nav can hide below `md` only if a mobile nav exists.
- Mobile nav uses `ResponsiveDrawer`.
- Secondary information on mobile should move into a drawer or accordion instead of sitting above the main task.
- Dialogs and drawers must:
  - trap the user's attention visually
  - fit inside the viewport
  - allow internal scrolling
  - keep the primary action reachable on short screens

## Multistep Flows

- Mobile pattern:
  primary step content first
  secondary summary behind a drawer or accordion
- Desktop pattern:
  sidebar summary visible and sticky only when it does not clip the content
- Step indicators:
  - current step must be obvious
  - completed steps may be revisited
  - future steps must not be open until prior validation passes

## New UI Checklist

Before merging new UI work:

- Confirm no horizontal scrolling at `320px`
- Confirm primary navigation is reachable on mobile
- Confirm primary CTA is reachable on short screens
- Confirm long dynamic content wraps safely
- Confirm buttons/actions stack cleanly when space is tight
- Reuse `SiteContainer`, `PageSection`, `StepShell`, or `ResponsiveDrawer` where applicable
- Add or update UI regression tests for any critical responsive behavior

## Anti-Patterns

- Route-specific `px-*` wrappers when `SiteContainer` would work
- Fixed-height mobile sections for forms or copy-heavy content
- Hidden mobile nav with no replacement
- Desktop-only sticky sidebars rendered above the main task on mobile
- Dialogs with unreachable buttons
- Hardcoded max widths or spacing copied between pages instead of shared primitives
