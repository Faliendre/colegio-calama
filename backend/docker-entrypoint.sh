#!/bin/sh
set -e

# Run key generation if APP_KEY is empty (mostly for troubleshooting/dev, prod should set this via env)
if [ -z "$APP_KEY" ]; then
    echo "WARNING: APP_KEY is empty. Generating key..."
    php artisan key:generate --show --no-interaction
fi

# Run Laravel migrations if database connection is configured
if [ -n "$DB_HOST" ]; then
    echo "Database host is set ($DB_HOST). Running database migrations..."
    # We use --force because it's running in production mode
    php artisan migrate --force --no-interaction
else
    echo "DB_HOST is not set. Skipping migrations."
fi

# Clear and cache configurations so runtime env variables are correctly cached
echo "Caching Laravel configuration, routes, and views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the actual Apache process in the foreground
echo "Starting Apache..."
exec apache2-foreground
