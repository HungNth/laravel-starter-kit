# 03: Authentication and account settings

Parent: [HeroUI migration](../spec.md)
Status: ready-for-agent
Delivery: complete
Delivery approval: approved
Blocked by: 02: Application shell, dashboard, and navigation

**What to build:** Migrate every authentication page, settings page, authentication layout, security dialog, and notification without changing server contracts.

- [x] Inertia and Wayfinder retain submissions, field names, refs, autocomplete, reset behavior, validation, and processing guards.
- [x] Password visibility, OTP and recovery-code switching, passkeys, and two-factor management retain their behavior.
- [x] Dialogs preserve labels, focus, cancellation, confirmation, and sensitive-state cleanup.
- [x] Settings, profile deletion, and flash messages use HeroUI presentation in both themes.
- [x] Alternate auth layouts compile and preserve their content.

Testing boundary: existing Auth and Settings HTTP tests, TypeScript, builds, and browser form/dialog behavior where available.
Demo path: login/registration/reset flows, profile, appearance, and security settings including validation and cancellation.

