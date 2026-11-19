FROM node:24-trixie-slim AS node
FROM ghcr.io/pnpm/pnpm:12.21.0 AS pnpm
FROM serversideup/php:8.4.27-fpm-nginx AS php

USER root

RUN mkdir -p bootstrap/cache storage/app/private storage/app/public \
        storage/framework/cache/data storage/framework/cache/locks \
        storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

FROM php AS build

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=pnpm /opt/pnpm/pnpm /usr/local/bin/pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY artisan composer.json composer.lock tsconfig.json vite.config.ts ./
COPY app/ app/
COPY bootstrap/ bootstrap/
COPY config/ config/
COPY database/ database/
COPY public/ public/
COPY resources/ resources/
COPY routes/ routes/

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader \
    && pnpm run build

FROM php

ENV APP_KEY_FILE=/var/www/html/storage/app/.app-key \
    HEALTHCHECK_PATH=/up \
    PHP_OPCACHE_ENABLE=1

COPY --from=build /var/www/html/artisan /var/www/html/composer.json ./
COPY --from=build /var/www/html/app/ app/
COPY --from=build /var/www/html/bootstrap/app.php /var/www/html/bootstrap/providers.php bootstrap/
COPY --from=build /var/www/html/config/ config/
COPY --from=build /var/www/html/database/ database/
COPY --from=build /var/www/html/public/ public/
COPY --from=build /var/www/html/resources/views/ resources/views/
COPY --from=build /var/www/html/routes/ routes/
COPY --from=build /var/www/html/vendor/ vendor/
COPY docker/entrypoint.d/20-prepare-laravel.sh /etc/entrypoint.d/

USER www-data
