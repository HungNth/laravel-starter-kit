<div align="center">
<img src="public/favicon.svg" alt="Laravel logo" width="36" height="36">

<h1>Laravel Starter Kit · React + HeroUI</h1>
</div>

Each branch contains a starter kit. The `react/heroui` branch includes registration, login, password resets, email verification, 2FA, and passkeys.

## Tech stack

- The backend uses PHP 8.4, Laravel 13, and Fortify.
- The frontend uses React 19, Inertia 3, TypeScript, HeroUI 3, and Tailwind CSS 4.

## Private homelab deployment

You'll need Docker Engine with Compose, Nginx Proxy Manager on the `proxy` Docker network, and a NetBird DNS record pointing your internal hostname to the proxy. If you already run MariaDB 11, clone the branch and enter the checkout in step 1, then continue at step 3.

1. Clone the deployment branch and start the shared PostgreSQL 18 project once per host.

    ```bash
    git clone --branch deploy/homelab --single-branch https://github.com/HungNth/laravel-starter-kit.git
    cd laravel-starter-kit
    cp -n .env.postgresql.example .env.postgresql
    chmod 600 .env.postgresql
    ```

    Set a strong `POSTGRES_PASSWORD` in `.env.postgresql`, then run:

    ```bash
    docker compose -p homelab-postgres --env-file .env.postgresql -f compose.postgresql.yaml up -d --wait
    docker compose -p homelab-postgres --env-file .env.postgresql -f compose.postgresql.yaml exec postgres psql -U postgres
    ```

2. At the `psql` prompt, create an empty database and a login that owns it. Set its password when prompted by `\password`.

    ```sql
    REVOKE CONNECT ON DATABASE postgres, template1 FROM PUBLIC;
    CREATE ROLE laravel LOGIN;
    \password laravel
    CREATE DATABASE laravel OWNER laravel;
    REVOKE CONNECT ON DATABASE laravel FROM PUBLIC;
    \q
    ```

    To add another app on the same host, use a separate checkout with its own `.env`. Repeat the role and database commands with a new name, such as `notes`, and a different password. Revoke `CONNECT` from `PUBLIC` on each new database so the other app logins cannot connect.

    In the new `.env`, set `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` to the new database name, login, and password. Keep `DB_NETWORK`, `DB_HOST`, and `DB_PORT` pointed at the shared PostgreSQL service. Choose a unique `COMPOSE_PROJECT_NAME` and `APP_PROXY_ALIAS`, such as `notes-homelab`, and set `APP_URL` to its own internal HTTP URL. Compose uses the project name to give the app its own `app-data` volume. Add a NetBird DNS record and a Proxy Host for the new hostname.

3. Create the app's `.env` from the deployment example.

    ```bash
    cp -n .env.homelab.example .env
    chmod 600 .env
    ```

    Set `APP_URL` to the app's internal HTTP URL and `DB_PASSWORD` to the app login's password. Fill in the SMTP settings. Single-quote values containing literal dollar signs. Leave `APP_KEY` blank to generate and save a key in the `app-data` volume, or provide your own key.

    For MariaDB 11, create an empty database and grant a dedicated login privileges on that database. In `.env`, set `DB_CONNECTION=mariadb` and set `DB_NETWORK` to an existing Docker network the app can use to reach the server. Set `DB_HOST` to the server address on that network and `DB_PORT` to its port (usually `3306`). Set `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` to the database and login you created.

    ```bash
    docker compose up -d --build --wait
    ```

4. In Nginx Proxy Manager, add a Proxy Host for the hostname in `APP_URL`. Set the scheme to `http`, the forward hostname to the value of `APP_PROXY_ALIAS`, and the forward port to `8080`. From a NetBird-connected device, check that `/up` returns HTTP 200 and `/login` loads with its styles.

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

## Homelab backups and updates

1. Back up the app before pulling changes. Stop the app first so the database and files reflect the same point in time. This example uses the PostgreSQL project and database names above. For MariaDB, use `mariadb-dump` for the database backup.

    ```bash
    (
        umask 077
        backup_dir=$(mktemp -d "$HOME/laravel-backup.XXXXXXXX") &&
            docker compose stop app &&
            docker compose -p homelab-postgres --env-file .env.postgresql -f compose.postgresql.yaml exec -T postgres pg_dump -U postgres -Fc laravel > "$backup_dir/database.dump" &&
            docker compose run --rm -T --no-deps --entrypoint tar app -czf - -C /var/www/html/storage/app . > "$backup_dir/app-data.tar.gz" &&
            cp .env "$backup_dir/.env" &&
            printf 'Backup saved to %s\n' "$backup_dir"
    )
    ```

    Keep the backup private. The generated key is in `app-data.tar.gz`. A supplied key is in the backed-up `.env`. If the backup fails, run `docker compose start app` to bring the current release back before retrying.

2. Keep the same `COMPOSE_PROJECT_NAME` and `APP_KEY` setting in `.env`, then pull and deploy.

    ```bash
    git pull --ff-only && docker compose up -d --build --wait
    ```

3. Check that `/up` returns HTTP 200 and `/login` loads through the proxy. Use these commands to check status, read startup errors, and list migrations once the app is healthy.

    ```bash
    docker compose ps --all
    docker compose logs --tail=100 app
    docker compose exec -T app php artisan migrate:status --no-interaction
    ```

## Tooling

- pnpm installs frontend dependencies. [Vite+](https://viteplus.dev/guide/check) runs the dev server, builds assets, formats code, and runs the linter.
- Pint formats PHP, Larastan runs static analysis, and Pest runs tests.
- Wayfinder generates TypeScript functions for Laravel routes. Run `composer ide` to generate IDE hints with Laravel IDE Helper.
- Find the Laravel Boost and HeroUI MCP configuration in [`.agents/mcp_config.json`](.agents/mcp_config.json).

### Frontend commands

| Command                | What it does                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| `pnpm run dev`         | Start Vite+ on its own. `composer run dev` starts it alongside Laravel. |
| `pnpm run build`       | Build frontend assets for production.                                   |
| `pnpm run build:ssr`   | Build both Inertia's client and SSR bundles.                            |
| `pnpm run check`       | Check formatting and run the Vite+ linter.                              |
| `pnpm run check:fix`   | Apply formatting and available lint fixes.                              |
| `pnpm run types:check` | Check TypeScript types with `tsc --noEmit`.                             |
