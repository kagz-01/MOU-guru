// routes/logout.tsx
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_, __) {
    const headers = new Headers();
    headers.set("Location", "/login");
    headers.set(
      "Set-Cookie",
      "auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
    );

    return new Response("", {
      status: 303,
      headers,
    });
  },
};
