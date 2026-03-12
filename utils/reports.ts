// utils/reports.ts
import { getAllMOUs } from "../db/models/mou.ts";

export async function ensureReportsDir(path = "reports") {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (_e) {
    // ignore if exists
  }
  return path;
}

export function timestampForFilename(d = new Date()) {
  // use ISO-like timestamp with timezone (Z for UTC)
  return d.toISOString().replace(/:/g, "-");
}

export async function saveMOUReport(
  opts?: { format?: "json" | "csv"; path?: string },
) {
  const format = opts?.format ?? "json";
  const dir = await ensureReportsDir(opts?.path);
  const mous = await getAllMOUs();
  const ts = timestampForFilename(new Date());
  const filename = `mou-report-${ts}.${format}`;
  const fullpath = `${dir}/${filename}`;

  if (format === "json") {
    await Deno.writeTextFile(fullpath, JSON.stringify(mous, null, 2));
  } else {
    // csv
    const headers = [
      "mou_id",
      "reference_no",
      "title",
      "start_date",
      "end_date",
      "status",
      "created_at",
    ];
    const rows = mous.map((m: Record<string, unknown>) =>
      headers.map((h) => String(m[h] ?? "")).join(",")
    );
    await Deno.writeTextFile(fullpath, [headers.join(","), ...rows].join("\n"));
  }

  return fullpath;
}
