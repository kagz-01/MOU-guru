# Local Demo Guide

This page shows quick steps to demo the MOU Guru app locally and how to trigger
reminders and generate reports.

Prerequisites

- Deno installed
- PostgreSQL running locally
- Environment variables set (see .env.example)

1. Apply migrations

```bash
# using the Deno runner
deno run --allow-net --allow-env --allow-read migrations/run_migrations.ts
```

2. Start the dev server (example using deno task start)

```bash
deno task start
```

3. Enable dev endpoints (in the same shell where you start the server)

```bash
export ALLOW_DEV_ENDPOINTS=true
```

4. Trigger reminders manually (dev-only endpoint)

```bash
curl -X POST http://localhost:8000/api/dev/trigger-reminders
```

5. Generate a report

```bash
curl -X POST http://localhost:8000/api/reports/generate
```

6. Upload a test attachment

Use the existing UI or a curl request that posts a multipart form to the upload
endpoint (see routes/api/attachments/upload/[id].ts for details).

Notes

- The dev trigger endpoint is gated by the `ALLOW_DEV_ENDPOINTS` env var to
  avoid accidental public execution.
- Reports will be created in the `reports/` folder.
- Reminders use TIMESTAMPTZ and will use your DB timezone settings; for reliable
  demos create a reminder with `fire_on` set a minute or two in the future and
  run the trigger endpoint.
