# Young & Hungry Brand System

## Direction

- Dark-first / deep space UI.
- Neon tech accents with blue-to-purple gradient.
- Soft glow, not harsh neon.
- Minimal, geometric, slightly rounded tech aesthetic.
- Stripe + Uber + fintech logistics hybrid.
- Execution platform clarity over marketing decoration.

## Colors

| Token | Value |
| --- | --- |
| Ink Black | `#0B0F1A` |
| Deep Navy | `#0F1629` |
| Card Surface | `#121A2B` |
| Border | `#1E2A3D` |
| Primary Text | `#FFFFFF` |
| Secondary Text | `#A9B4C7` |
| Muted Text | `#6B778C` |
| Disabled | `#3A465A` |
| Gradient A | `#7C3AED` |
| Gradient B | `#3B82F6` |
| Soft Blend A | `#A855F7` |
| Soft Blend B | `#60A5FA` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#3B82F6` |

## Shape

- Small elements: `8px`
- Buttons: `12px`
- Cards: `16px`
- Modals: `20px`
- Hero containers: `24px`

## Shadows

- Soft card shadow: `0 10px 30px rgba(0, 0, 0, 0.35)`
- Hover lift: `0 14px 40px rgba(0, 0, 0, 0.45)`
- Glow accent: `0 0 20px rgba(99, 102, 241, 0.25)`

## Typography

- Display: `Space Grotesk`
- UI/body: `Instrument Sans`
- Mono: `JetBrains Mono`

## Motion

- Buttons scale `1.00 -> 1.03`.
- Cards lift and glow on hover.
- Page transitions fade with slight upward motion.
- Fast UI timing: `120-180ms`.
- Standard timing: `200-250ms`.
- Page transition timing: `300-400ms`.

## Responsive Implementation

- Responsive layout rules live in [docs/RESPONSIVE_SYSTEM.md](./RESPONSIVE_SYSTEM.md).
- Brand work should use the shared layout primitives instead of route-specific wrappers:
  - `SiteContainer`
  - `PageSection`
  - `StepShell`
  - `ResponsiveDrawer`
- Typography, spacing, and card composition should scale from mobile first. Brand polish must not rely on fixed mobile heights or desktop-only spacing assumptions.
