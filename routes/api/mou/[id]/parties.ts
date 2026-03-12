// routes/api/mou/[id]/parties.ts
import { Handlers } from "$fresh/server.ts";
import {
  addPartyToMOU,
  getPartiesByMOU,
  removePartyFromMOU,
} from "../../../../db/models/mou_parties.ts";
import { verifyJWT } from "../../../../utils/auth.ts";

export const handler: Handlers = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    try {
      const parties = await getPartiesByMOU(Number(id));
      return new Response(JSON.stringify(parties), { status: 200 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
      });
    }
  },

  async POST(req, ctx) {
    const { id } = ctx.params;
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

      const { party_id, role } = await req.json();
      if (!party_id || !role) {
        return new Response("Missing party_id or role", { status: 400 });
      }

      await addPartyToMOU(Number(id), Number(party_id), role);
      return new Response(
        JSON.stringify({ message: "Party added successfully" }),
        { status: 201 },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
      });
    }
  },

  async DELETE(req, ctx) {
    const { id } = ctx.params;
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

      const url = new URL(req.url);
      const party_id = url.searchParams.get("party_id");

      if (!party_id) {
        return new Response("Missing party_id", { status: 400 });
      }

      await removePartyFromMOU(Number(id), Number(party_id));
      return new Response(
        JSON.stringify({ message: "Party removed successfully" }),
        { status: 200 },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
      });
    }
  },
};
