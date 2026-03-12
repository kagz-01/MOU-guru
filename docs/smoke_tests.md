# Running smoke tests

Ensure the application is running locally (deno task start) and that dev
endpoints are enabled:

```bash
export ALLOW_DEV_ENDPOINTS=true
deno task start
```

Run the smoke test script from the project root:

```bash
deno run --allow-net --allow-env tests/smoke_tests.ts
```

You can change the server base URL with the `APP_BASE` env var, for example:

```bash
APP_BASE='http://localhost:3000' deno run --allow-net --allow-env tests/smoke_tests.ts
```

The script POSTS to `/api/reports/generate` and `/api/dev/trigger-reminders` and
prints responses to stdout.
