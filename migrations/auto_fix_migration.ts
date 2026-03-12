// migrations/auto_fix_migration.ts
// Small utility to fix common accidental SQL formatting issues in the migration
// - Joins split 'ON DELETE\n  CASCADE' or 'ON UPDATE\n  CASCADE' into single line
// - Converts reminders.fire_on from DATE to TIMESTAMPTZ

const path = "./migrations/001_initial.sql";

async function main() {
  const original = await Deno.readTextFile(path);
  let fixed = original;

  // Repair split CASCADE lines after ON DELETE or ON UPDATE
  fixed = fixed.replace(
    /(ON\s+(?:DELETE|UPDATE)\s*)\n\s*CASCADE/gi,
    "$1CASCADE",
  );

  // If someone accidentally left a line with just 'CASCADE', remove it if not attached.
  fixed = fixed.replace(/^\s*CASCADE\s*$/gim, "");

  // Ensure reminders.fire_on uses TIMESTAMPTZ not DATE
  fixed = fixed.replace(
    /fire_on\s+DATE\s+NOT\s+NULL/gi,
    "fire_on TIMESTAMPTZ NOT NULL",
  );

  if (fixed !== original) {
    await Deno.writeTextFile(path, fixed);
    console.log("migration fixed and saved to", path);
  } else {
    console.log("no changes necessary");
  }
}

if (import.meta.main) {
  main();
}
