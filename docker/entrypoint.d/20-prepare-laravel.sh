#!/bin/sh
set -eu

if [ "${SERVERSIDEUP_DEFAULT_COMMAND:-false}" != "true" ]; then
    return 0
fi

cd "$APP_BASE_DIR"

echo "Waiting for database at $DB_HOST:$DB_PORT"
if ! timeout 60s sh -c 'until php artisan db:monitor --no-interaction >/dev/null 2>&1; do sleep 2; done'; then
    echo "Database at $DB_HOST:$DB_PORT was not usable after 60 seconds. Check the connection settings and database permissions." >&2
    exit 1
fi

if [ -z "${APP_KEY:-}" ]; then
    if [ ! -e "$APP_KEY_FILE" ]; then
        temporary_key=$(mktemp "${APP_KEY_FILE}.XXXXXX")
        trap 'rm -f "$temporary_key"' EXIT
        php artisan key:generate --show --no-ansi --no-interaction > "$temporary_key"
        ln -T "$temporary_key" "$APP_KEY_FILE" || test -e "$APP_KEY_FILE"
    fi

    if [ ! -f "$APP_KEY_FILE" ] || [ ! -r "$APP_KEY_FILE" ] || [ ! -s "$APP_KEY_FILE" ]; then
        echo "Persisted APP_KEY at $APP_KEY_FILE is empty or unreadable. Restore the key to start Laravel." >&2
        exit 1
    fi
fi

php -d zend.exception_ignore_args=1 -r '
    require "vendor/autoload.php";
    $app = require "bootstrap/app.php";
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $app->make("encrypter");
'
php artisan migrate --force --no-interaction
