#!/bin/sh
set -e

# Run key generation if APP_KEY is empty (mostly for troubleshooting/dev, prod should set this via env)
if [ -z "$APP_KEY" ]; then
    echo "WARNING: APP_KEY is empty. Generating key..."
    php artisan key:generate --show --no-interaction
fi

# Run Laravel migrations only if RUN_MIGRATIONS is set to true
if [ "$RUN_MIGRATIONS" = "true" ] && [ -n "$DB_HOST" ]; then
    echo "RUN_MIGRATIONS is set to true. Running database migrations..."
    php artisan migrate --force --no-interaction
else
    echo "Skipping migrations (RUN_MIGRATIONS is not set to true or DB_HOST is empty)."
fi

# Clear and cache configurations so runtime env variables are correctly cached
echo "Caching Laravel configuration and views..."
php artisan config:cache
php artisan view:cache

# Start the actual Apache process in the foreground
echo "Starting Apache..."
exec apache2-foreground
