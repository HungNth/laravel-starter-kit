<div align="center">
<img src="public/favicon.svg" alt="Laravel logo" width="36" height="36">

<h1>Laravel Starter Kit · React + HeroUI</h1>
</div>

Each branch contains a starter kit. The `react/heroui` branch includes registration, login, password resets, email verification, 2FA, and passkeys.

## Tech stack

- The backend uses PHP 8.4, Laravel 13, and Fortify.
- The frontend uses React 19, Inertia 3, TypeScript, HeroUI 3, and Tailwind CSS 4.

## Local development

You'll need Git, Composer, PHP 8.4, Node.js 24 (24.11 or later), and pnpm 12.21.0.

1. Clone the `react/heroui` branch from GitHub.

   ```bash
   git clone --branch react/heroui --single-branch https://github.com/HungNth/laravel-starter-kit.git
   cd laravel-starter-kit
   ```

2. Install dependencies and create your `.env` file.

   ```bash
   composer install
   php -r "file_exists('.env') || copy('.env.example', '.env');"
   php artisan key:generate --no-interaction
   pnpm install --frozen-lockfile
   ```

3. Set your database connection in `.env`, then run the migrations and start the app.

   ```bash
   php artisan migrate --no-interaction
   composer run dev
   ```

   Open the address Laravel prints in the terminal. The default is `http://localhost:8000`. When you try signing up locally, look for the email verification link in `storage/logs/laravel.log`.

## Tooling

- pnpm installs frontend dependencies. [Vite+](https://viteplus.dev/guide/check) runs the dev server, builds assets, formats code, and runs the linter.
- Pint formats PHP, Larastan runs static analysis, and Pest runs tests.
- Wayfinder generates TypeScript functions for Laravel routes. Run `composer ide` to generate IDE hints with Laravel IDE Helper.
- Find the Laravel Boost and HeroUI MCP configuration in [`.agents/mcp_config.json`](.agents/mcp_config.json).

### Frontend commands

| Command | What it does |
| --- | --- |
| `pnpm run dev` | Start Vite+ on its own. `composer run dev` starts it alongside Laravel. |
| `pnpm run build` | Build frontend assets for production. |
| `pnpm run build:ssr` | Build both Inertia's client and SSR bundles. |
| `pnpm run check` | Check formatting and run the Vite+ linter. |
| `pnpm run check:fix` | Apply formatting and available lint fixes. |
| `pnpm run types:check` | Check TypeScript types with `tsc --noEmit`. |
