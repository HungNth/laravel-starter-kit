FROM composer:2 AS composer
FROM node:24-trixie-slim AS node
FROM ghcr.io/pnpm/pnpm:12.21.0 AS pnpm

FROM php:8.4.27-apache-trixie AS php

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libpq5 \
    && docker-php-ext-install -j"$(nproc)" opcache pdo_mysql pdo_pgsql \
    && apt-get purge -y --auto-remove libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && a2enmod rewrite \
    && sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' /etc/apache2/sites-available/000-default.conf \
    && printf '<Directory /var/www/html/public>\n    AllowOverride All\n</Directory>\n' > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

WORKDIR /var/www/html

RUN mkdir -p bootstrap/cache storage/app/private storage/app/public \
        storage/framework/cache/data storage/framework/cache/locks \
        storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

FROM php AS build

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=pnpm /opt/pnpm/pnpm /usr/local/bin/pnpm

RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/*

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

COPY --from=build /var/www/html/artisan /var/www/html/composer.json ./
COPY --from=build /var/www/html/app/ app/
COPY --from=build /var/www/html/bootstrap/app.php /var/www/html/bootstrap/providers.php bootstrap/
COPY --from=build /var/www/html/config/ config/
COPY --from=build /var/www/html/database/ database/
COPY --from=build /var/www/html/public/ public/
COPY --from=build /var/www/html/resources/views/ resources/views/
COPY --from=build /var/www/html/routes/ routes/
COPY --from=build /var/www/html/vendor/ vendor/
