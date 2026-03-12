#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
// don't import a Tailwind or unrelated config here — dev() expects a FreshConfig-compatible options object.
// If you need the Tailwind config elsewhere, import it in the file that uses it.

import "$std/dotenv/load.ts";

await dev(import.meta.url, "./main.ts");
