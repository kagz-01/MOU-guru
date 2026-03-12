# Migrations

This project includes a single SQL migration at `migrations/001_initial.sql`
which creates the initial schema for local development.

Two ways to apply the migration locally:

1. Using the bundled Deno runner (recommended for convenience):

deno run --allow-net --allow-env --allow-read migrations/run_migrations.ts

This will use the DB connection configured via environment variables:

- DB_HOST (default: localhost)
- DB_NAME (default: MOU-Records)
- DB_USER (default: postgres)
- DB_PASSWORD (default: pgAdmin1234)
- DB_PORT (default: 5432)

2. Using psql (if you prefer):

psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migrations/001_initial.sql

Note: replace $DB_HOST, $DB_USER and $DB_NAME with your local DB settings.

Rollback: this migration creates multiple tables and enums; to rollback in
development you can drop the database and recreate it, or run DROP TABLE/DROP
TYPE statements manually.

Verification: after running, connect to the DB and run `\dt` to see tables and
`SELECT * FROM reminders LIMIT 1;` to confirm TIMESTAMPTZ column `fire_on`
exists and is populated as expected.

Alternative: helper script

You can use the provided helper script which will load a local `.env` (if
present), run the migration, and then start the dev server:

    ./scripts/start_local.sh

Make the script executable once: `chmod +x scripts/start_local.sh` and ensure
`.env` is in project root with your DB credentials.
