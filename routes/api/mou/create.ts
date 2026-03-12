// routes/api/mou/create.ts
import { Handlers } from "$fresh/server.ts";
import { createMOU } from "../../../db/models/mou.ts";
import { verifyJWT } from "../../../utils/auth.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    try {
      // 1. Authenticate user
      const cookies = req.headers.get("cookie");
      const tokenMatch = cookies?.match(/auth_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;

      if (!token) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
        });
      }

      const user = await verifyJWT(token) as unknown as {
        user_id: number;
        role: string;
      };
      if (!user) {
        return new Response(JSON.stringify({ message: "Invalid session" }), {
          status: 401,
        });
      }

      // Guest users (id 0 or role 'viewer' acting like guests if we want to restrict)
      // Usually handled by middleware, but good to double check for API routes
      if (user.user_id === 0) {
        return new Response(
          JSON.stringify({ message: "Guests cannot create MOUs" }),
          { status: 403 },
        );
      }

      // 2. Parse request body
      const data = await req.json();

      // Basic validation
      if (
        !data.reference_no || !data.title || !data.start_date || !data.end_date
      ) {
        return new Response(
          JSON.stringify({ message: "Missing required core details" }),
          { status: 400 },
        );
      }

      // 3. Insert into database
      // The `mous` table has many fields, some optional. We map the wizard data here.
      const mouId = await createMOU({
        reference_no: data.reference_no,
        title: data.title,
        description: data.description || null,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        status: "Draft", // Always start as Draft
        governing_law: data.governing_law || null,
        confidentiality: data.confidentiality || false,
        ip_terms: data.ip_terms || null,
        renewal_terms: data.renewal_terms || null,
        termination_clause: data.termination_clause || null,
        owning_department_id: data.owning_department_id
          ? Number(data.owning_department_id)
          : 1, // Fallback
        created_by: user.user_id,
      });

      // We might want to save the extra fields (governing_law, ip_terms, etc.)
      // For now, we are using the existing schema which might not have all these fields.
      // If the schema needs updating, we should do that, but for this step we map
      // what we can to `description` or just return success for the core fields.
      // Ideally, a `mou_terms` jsonb column would store these.

      return new Response(
        JSON.stringify({
          message: "MOU Created successfully",
          mou_id: mouId,
        }),
        { status: 201 },
      );
    } catch (error) {
      console.error("Error creating MOU:", error);
      const errMessage = error instanceof Error
        ? error.message
        : "Internal server error";
      return new Response(
        JSON.stringify({ message: errMessage }),
        { status: 500 },
      );
    }
  },
};
