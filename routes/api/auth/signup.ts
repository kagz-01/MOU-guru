// routes/api/auth/signup.ts
import { Handlers } from "$fresh/server.ts";
import { createJWT, hashPassword } from "../../../utils/auth.ts";
import { createUser, getUserByEmail, User } from "../../../db/models/user.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const form = await req.formData();
      const full_name = (form.get("name") || "").toString().trim();
      const email = (form.get("email") || "").toString().trim().toLowerCase();
      const password = (form.get("password") || "").toString();

      if (!full_name || !email || !password) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400 },
        );
      }

      // Check if user exists
      const existing = await getUserByEmail(email);
      if (existing) {
        return new Response(JSON.stringify({ error: "User already exists" }), {
          status: 409,
        });
      }

      const password_hash = await hashPassword(password);

      const userId = await createUser({
        email,
        full_name,
        role: "viewer",
        password_hash,
      });

      // Create a JWT and set cookie
      const user = {
        user_id: userId,
        email,
        full_name,
        role: "viewer",
      } as User;
      const token = await createJWT(user);

      const headers = new Headers();
      headers.set("Location", "/dashboard");
      headers.set(
        "Set-Cookie",
        `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      );

      return new Response("", { status: 303, headers });
    } catch (e) {
      console.error("Signup error", e);
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
      });
    }
  },
};
