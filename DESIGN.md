# Application UI design

This file records the visual direction used by the HeroUI migration and future UI changes. Migration scope and delivery remain in the [spec](.scratch/heroui-migration/spec.md), with the library choice recorded in the [ADR](docs/adr/0001-use-heroui-v3.md).

## Direction

An account-focused Laravel starter application with familiar navigation and readable forms. HeroUI v3 supplies the component appearance; the existing application supplies the content and page structure. The repeated visual pattern is a clear section heading, a short explanation, related fields, and a visible action.

Dial: ENERGY 1 / RHYTHM 1 / MOTION 1. Low visual intensity, consistent section spacing, and motion limited to interaction feedback and necessary loading indicators.

## Theme and color

The palette follows HeroUI's default theme, with its blue accent for primary actions and focus. Color roles resolve through the installed theme CSS in both light and dark mode.

| UI role          | Semantic utilities                   |
| ---------------- | ------------------------------------ |
| Page             | `bg-background text-foreground`      |
| Content surface  | `bg-surface text-surface-foreground` |
| Supporting text  | `text-muted`                         |
| Floating content | `bg-overlay text-overlay-foreground` |
| Primary emphasis | `bg-accent text-accent-foreground`   |
| Component edge   | `border-border`                      |
| Section divider  | `border-separator`                   |

Success, warning, and danger indicate outcomes or risks, accompanied by text. HeroUI variants own control colors, radius, elevation, and interaction states. Shared theme overrides belong in the application stylesheet, with the corresponding decision updated here.

The existing light/dark/system choice remains available and persistent. Each view has equivalent hierarchy and readable feedback in both themes.

## Typography and identity

- Use Inter for application text. Laravel Vite serves the font and defines `--font-inter` with system sans-serif fallbacks. The application connects it to `font-sans` so HeroUI controls inherit the same font.
- Existing logos, Lucide icons, English copy, and navigation labels remain. The existing Laravel SVG artwork on Welcome retains its brand colors; surrounding UI uses semantic theme colors. Icons identify existing actions; the same action uses the same icon across layouts.
- Page and section headings retain the current restrained scale. Descriptions are subordinate to headings, while labels and errors remain readable at normal zoom.
- Monospace is reserved for authentication codes and recovery codes, where distinguishing characters matters.

## Layout

Auth pages retain their focused form column, with the simple layout capped at the existing `max-w-sm`. Settings retain their section navigation and bounded form width. Dashboard and Welcome retain their existing content and hierarchy.

Related controls share alignment and spacing. Custom layout spacing follows a 4px rhythm. Components keep their HeroUI geometry; nested wrappers do not add another competing layer of padding, border, or shadow.

Desktop navigation retains collapse, the active-page marker, and account access. On mobile it moves into a dismissible drawer, and settings navigation stacks above the form. Long email addresses, errors, and recovery codes wrap or scroll within their own region instead of widening the page.

## Forms and feedback

Each form has a clear main action. Destructive actions remain separated from routine saves and retain their confirmation step. Loading feedback occupies a stable place beside the relevant action, with repeat submission disabled while processing.

Fields retain visible labels, autocomplete, password visibility controls, and adjacent validation messages. Page-level failures receive persistent feedback; transient success feedback uses the shared toast presentation. Existing error wording and server validation remain authoritative.

Inputs and OTP slots inside dialogs and drawers must be visually distinct from the surrounding surface before they receive focus, in both light and dark mode. Prefer HeroUI’s `secondary` variant when the default fill blends into the surface. Keep focus and validation states visible.

Authentication dialogs retain their titles, initial focus, keyboard dismissal where permitted, focus return, and cleanup on close. OTP and recovery-code entry remain distinct modes. QR codes and recovery codes stay legible in both themes.

## Accessibility and motion

Keyboard access covers navigation, menus, forms, drawers, and dialogs, with visible focus throughout. Icon-only actions have accessible names. Touch controls have sufficient target area and separation. Text contrast targets WCAG AA, and meaning remains understandable without color.

- Desktop sidebar width and adjacent content move together. Labels fade out before the sidebar narrows and fade in once it reaches its expanded width. Keep them on one line.
- Drawers, dialogs, and dropdowns use HeroUI’s built-in transitions. Use short CSS transitions for app-owned controls that change layout or visibility.
- Under reduced motion, sidebar layout and labels update immediately. The password-reset pending indicator stays visible without rotation.

Static dashboard placeholders remain visibly placeholders; future content uses actual application data.

## Keeping this direction consistent

Visual changes are reviewed against this file on mobile and desktop, in both themes, including loading, empty, invalid, and disabled states that apply. A deliberate change to the shared palette, type, geometry, or layout is recorded here alongside its implementation. The installed HeroUI API and theme CSS determine available tokens; package upgrades include a comparison against this direction before adopting changed defaults.

Reference: [HeroUI design guidance](https://heroui.com/en/docs/react/getting-started/design-md), [default theme reference](https://heroui.com/react/DESIGN.md), and [theming](https://heroui.com/en/docs/react/getting-started/theming).
