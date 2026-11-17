# HeroUI migration

Status: ready-for-agent
Delivery: complete

Delivery approval: approved by the user. Implement the four delivery tickets and the verification approach below, including DESIGN.md and the local MCP configuration. Keep changes uncommitted.

## Problem statement

The application currently uses shadcn components built on Radix. The user wants the entire UI to use HeroUI and wants the coding agent to access HeroUI's official documentation through MCP.

## Solution

Migrate every existing page, shared component, and layout to HeroUI v3. Keep the current page structure and behavior, and adopt HeroUI's default component appearance. Configure the HeroUI MCP server alongside Laravel Boost at project scope.

Maintain the root [DESIGN.md](../../DESIGN.md) as the shared visual and interaction reference, linked from the project agent instructions so future UI work uses the same direction.

## User stories

1. As a visitor, I want the welcome page and its existing links to work with the new UI.
2. As a user, I want the dashboard to retain its current content without invented metrics.
3. As a visitor, I want to register and see validation errors beside the relevant fields.
4. As a user, I want password and passkey login to keep their existing behavior.
5. As a user, I want to request and complete a password reset.
6. As a user, I want to confirm my password and request email verification when required.
7. As a user, I want to enter a six-digit authentication code or switch to a recovery code.
8. As a user, I want to update my profile and see the result of saving it.
9. As a user, I want to update my password with the existing validation and sensitive-field reset behavior.
10. As a user, I want to enable, confirm, and disable two-factor authentication and manage recovery codes.
11. As a user, I want to register and delete passkeys with clear progress and error states.
12. As a user, I want account deletion to retain password verification and deliberate confirmation.
13. As a user, I want sidebar navigation, its collapsed state, keyboard shortcut, and mobile drawer to keep working.
14. As a user, I want my light, dark, or system preference to survive navigation and reloads.
15. As a keyboard or screen-reader user, I want labeled fields, visible focus, usable menus, and predictable modal focus.
16. As a developer, I want alternate layouts to work without retaining the old UI library.
17. As a developer, I want HeroUI documentation available through the project's MCP configuration.
18. As a maintainer, I want a project design reference so future UI changes preserve the same appearance and interaction conventions.

## Implementation decisions

- Follow the accepted [HeroUI ADR](../../docs/adr/0001-use-heroui-v3.md).
- Keep the implementation aligned with [DESIGN.md](../../DESIGN.md), updating the document alongside intentional changes to shared design decisions. The file records the implemented direction; verification evidence is recorded in ticket 04.
- Use the installed React 19, Tailwind 4, Inertia 3, and existing package manager. Confirm resolved package versions and peer requirements before installation. Add HeroUI React and styles; avoid unrelated upgrades.
- Import HeroUI components directly. Application components may retain their own state and behavior, without emulating the removed shadcn API.
- Preserve the existing typography, icons, logo, text, routes, and page hierarchy. Use HeroUI theme tokens for surfaces, controls, feedback, and focus. Respect reduced-motion preferences.
- Keep Inertia responsible for submissions and navigation, and Wayfinder responsible for route generation. Preserve DOM field names, refs, autocomplete, default values, validation, reset behavior, and processing guards. Apply HeroUI styles to Inertia links using the documented composition API where appropriate.
- Preserve the existing appearance persistence and sidebar cookie. Desktop collapse, Ctrl/Cmd+B, active navigation, collapsed tooltips, mobile dismissal, and alternate header layout remain required.
- Use free HeroUI components, including Drawer for mobile navigation, with application-owned desktop sidebar composition. HeroUI's catalog lists the ready-made Sidebar and AppLayout as Pro; this migration does not require purchasing Pro.
- Replace Sonner presentation with HeroUI Toast while preserving existing flash types. Map the application's error notification to HeroUI's supported danger notification API.
- Use HeroUI InputOTP and its exported digit pattern. Removing the application's direct input-otp import does not imply removing HeroUI's transitive dependency on that package.
- Preserve cleanup when authentication dialogs close, sensitive-field reset behavior, confirmation before deletion, accessible titles, focus containment, and focus return.
- Configure the official stdio MCP server through pnpm dlx and @heroui/react-mcp@1.1.4, preserving Laravel Boost. Verify initialization and tool discovery independently; report whether this running agent can access the new tools.
- Remove obsolete shadcn components, configuration, CSS tokens, and unused direct dependencies only after all callers migrate. Check helper usage before deleting shared utilities.
- Keep checks applicable to replacement application code; remove stale UI-folder lint/format exclusions when they no longer describe the source.
- Keep all work uncommitted.

## Testing decisions

- Existing HTTP feature tests remain the automated boundary for auth, settings, profile deletion, and route access. They protect backend behavior but cannot prove client interaction correctness.
- Run TypeScript, the configured frontend checks, a production build, and an SSR build after integration. Run affected Auth, Settings, and Dashboard feature tests.
- Verify browser behavior at mobile and desktop widths in both themes: navigation, form payloads and errors, submission progress, dialog focus/cleanup, OTP/recovery switching, toast feedback, theme persistence, and sidebar persistence.
- Compare rendered pages against DESIGN.md for typography, semantic colors, spacing, component geometry, and interaction states; confirm the agent instructions link to the design reference.
- Retain alternate layouts and verify they compile; exercise their behavior through an existing preview or temporary local preview if available, without adding production routes solely for testing.
- Do not install another test framework or browser package without agreement. Add or adjust tests only for changed behavior with meaningful regression coverage.
- Report checks that could not run. Passkey hardware and credential-dependent flows require a suitable browser and authenticator; a PHP feature test alone does not verify those flows.

## Delivery tickets

The user approved this breakdown. Individual tickets are published in the adjacent issues directory.

1. **HeroUI foundation and welcome page.** No blockers. Maintain DESIGN.md and its agent-instruction link, configure and verify MCP, add required packages/styles, and render the existing public welcome page using HeroUI. Check theme compatibility with remaining pages and compare the result with the design reference. Demo: existing public page and MCP tool discovery.
2. **Application shell, dashboard, and navigation.** Blocked by 1. Migrate both application layouts, sidebar, mobile drawer, breadcrumbs, user menu, and dashboard. Preserve collapse, persistence, shortcut, active links, and navigation. Demo: dashboard and navigation on desktop/mobile in both themes.
3. **Authentication and account settings.** Blocked by 2. Migrate all authentication pages, auth layout variants, settings, security dialogs, passkeys, OTP, and flash notifications. Preserve field contracts and authentication lifecycle behavior. Demo: the existing authentication and settings flows, including validation failures and cancellation.
4. **Remove the old UI and verify the integrated application.** Blocked by 3. Remove unused components/dependencies/configuration/tokens, restore appropriate check coverage, run the agreed checks, and report browser and hardware verification limits. Demo: all existing pages with no remaining shadcn/Radix application imports.

## Out of scope

New product features, new dashboard data, translations, a branding redesign, auth/backend contract changes, database changes, paid HeroUI components, unrelated package upgrades, deployment, and Git commits.

## Further notes

The repository uses the [local Markdown tracker](../../docs/agents/issue-tracker.md) with the [default triage vocabulary](../../docs/agents/triage-labels.md) and [single-context domain documentation](../../docs/agents/domain.md). Individual implementation tickets are in the adjacent issues directory.

Sources: [LLM index](https://heroui.com/react/llms.txt), [quick start](https://heroui.com/en/docs/react/getting-started/quick-start), [MCP setup](https://heroui.com/en/docs/react/getting-started/mcp-server), [composition](https://heroui.com/en/docs/react/getting-started/composition), [component catalog](https://heroui.com/en/docs/react/components), [Drawer](https://heroui.com/en/docs/react/components/drawer), [InputOTP](https://heroui.com/en/docs/react/components/input-otp), [Toast](https://heroui.com/en/docs/react/components/toast), and [Inertia forms](https://inertiajs.com/docs/v3/the-basics/forms).

