#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Postgres is up - running migrations..."

# Run database migrations (init.sql)
echo "Running database initialization..."
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < /app/database/init.sql || true

echo "Database initialization completed"

# Load seed data if seed.sql exists
if [ -f /app/database/seed.sql ]; then
  echo "Loading seed data..."
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < /app/database/seed.sql || true
  echo "Seed data loaded successfully"
else
  echo "No seed.sql file found, skipping seed data"
fi

echo "Starting Node.js application..."
exec npm start
