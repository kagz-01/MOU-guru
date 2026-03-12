// routes/api/parties.ts
import { Handlers } from "$fresh/server.ts";
import { createParty, getAllParties } from "../../db/models/party.ts";
import { verifyJWT } from "../../utils/auth.ts";

export const handler: Handlers = {
  async GET() {
    try {
      const parties = await getAllParties();
      return new Response(JSON.stringify(parties), { status: 200 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
      });
    }
  },

  async POST(req) {
    try {
      const cookies = req.headers.get("cookie");
      const tokenMatch = cookies?.match(/auth_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;

      if (!token) return new Response("Unauthorized", { status: 401 });
      const user = await verifyJWT(token) as unknown as {
        user_id: number;
        role: string;
      };
      if (!user || user.user_id === 0) {
        return new Response("Forbidden", { status: 403 });
      }

      const { name, address, type } = await req.json();
      if (!name) {
        return new Response("Missing required firm name", { status: 400 });
      }

      const partyId = await createParty({
        name,
        address: address || null,
        type: type || null,
      });
      return new Response(
        JSON.stringify({
          message: "Entity stored successfully",
          party_id: partyId,
        }),
        { status: 201 },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
      });
    }
  },
};
