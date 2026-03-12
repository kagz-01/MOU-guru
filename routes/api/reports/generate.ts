// routes/api/reports/generate.ts
import { Handlers } from "$fresh/server.ts";
import { saveMOUReport } from "../../../utils/reports.ts";
import { forbidGuestWrites } from "../../../utils/guards.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    // defense-in-depth: forbid guest writes at the handler level as well
    const blocked = forbidGuestWrites(
      req,
      (ctx.state.user as { id: number } | null) ?? null,
    );
    if (blocked) return blocked;

    try {
      const path = await saveMOUReport({ format: "json" });
      return new Response(JSON.stringify({ path }), { status: 201 });
    } catch (e) {
      console.error("report generation failed", e);
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
      });
    }
  },
};
