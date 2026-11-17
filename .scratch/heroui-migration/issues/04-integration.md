# 04: Remove the old UI and verify integration

Parent: [HeroUI migration](../spec.md)
Status: ready-for-agent
Delivery: complete
Delivery approval: approved
Blocked by: 03: Authentication and account settings

**What to build:** Finish the migration with no obsolete UI layer, then verify the integrated application and record actual verification limits.

- [x] No application imports remain for shadcn components, Radix, Sonner, or direct input-otp use.
- [x] Unused UI files, dependencies, configuration, semantic aliases, and stale check exclusions are removed.
- [x] TypeScript, frontend checks, production/SSR builds, and affected feature tests pass.
- [x] The design reference matches the implemented visual decisions.
- [x] Browser, hardware, and MCP session availability limits are reported without claiming unperformed checks.

Testing boundary: integrated compilation, frontend checks, existing feature tests, dependency/import audit, and browser inspection where available.
Demo path: existing pages, light/dark/system preferences, mobile navigation, form errors, overlays, and notifications.

## Comments

Completed on 2026-11-17. HeroUI React and styles are pinned to 3.2.7. Application imports no longer reference shadcn, Radix, Sonner, or input-otp directly. The old UI directory, shadcn configuration, unused dependencies, theme aliases, and obsolete check exclusions were removed.

Verification passed:

- `pnpm exec tsc --noEmit` and `pnpm run check` (formatting and lint).
- `pnpm run build:ssr`, covering both the production client and SSR bundles.
- `php artisan test --compact tests/Feature/Auth tests/Feature/Settings tests/Feature/DashboardTest.php`: 40 tests, 145 assertions.
- Chrome against a separate SQLite database: registration validation and password reset, email verification, desktop sidebar collapse/cookie/shortcut, account menu, profile save and HeroUI success toast, delete-account cancellation and Escape, theme persistence, responsive widths 375/768/1280, mobile navigation, password confirmation, 2FA setup and failed/successful OTP confirmation, recovery-code error and mode switching, logout, remember-me payload, password visibility, password reset email and login with the changed password.
- Chrome's virtual authenticator: passkey registration, cancellation of deletion, and confirmed deletion. Browser assertions reported no runtime exceptions or console errors. The local browser check is [browser-check.mjs](../browser-check.mjs); it requires the isolated test server, Chrome CDP, log mailer, and disposable database used during this migration.
- Temporary previews rendered the card/split auth layouts and header application layout in both themes at all three widths. Header drawer dismissal and breadcrumb navigation worked. The temporary preview source was removed.
- Light/dark appearance screenshots were visually inspected against DESIGN.md. They are local artifacts under `storage/framework/testing/heroui-light.png` and `heroui-dark.png`.
- HeroUI MCP 1.1.4 initialized, listed six documentation tools, and returned Button documentation. Laravel Boost configuration remains present. `pnpm dlx` is used because this repository's package-manager policy rejects an npm/npx launch.

Limits: physical passkey devices and OS credential dialogs were not tested. Restart the Codex session to expose the newly configured HeroUI MCP tools. Optional fontaine/font fallback and existing Vite alias peer warnings remain outside this migration. No deployment or Git commit was performed.

