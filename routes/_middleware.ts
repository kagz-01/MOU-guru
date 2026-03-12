// routes/_middleware.ts
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { verifyJWT } from "../utils/auth.ts";
import { forbidGuestWrites, jsonError } from "../utils/guards.ts";

interface State {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const url = new URL(req.url);

  // Skip auth for public routes and static assets
  const publicPaths = new Set(["/", "/login", "/signup", "/explore"]);
  if (publicPaths.has(url.pathname) || url.pathname.startsWith("/static/")) {
    return await ctx.next();
  }

  // Allow auth API endpoints (signup/login) to be public
  if (url.pathname.startsWith("/api/auth")) {
    return await ctx.next();
  }

  // If dev endpoints are explicitly enabled, allow some API paths to bypass auth
  if (Deno.env.get("ALLOW_DEV_ENDPOINTS") === "true") {
    if (
      url.pathname.startsWith("/api/dev") ||
      url.pathname === "/api/reports/generate"
    ) {
      return await ctx.next();
    }
  }

  // Allow explicit guest access to dashboard via ?guest=true for reads
  if (
    url.pathname === "/dashboard" && url.searchParams.get("guest") === "true"
  ) {
    // guest reads are allowed; writes will be checked after auth verification would have occurred
    return await ctx.next();
  }

  // Get the auth token from cookies
  const cookies = req.headers.get("cookie") || "";
  const tokenMatch = cookies.match(/auth_token=([^;]+)/);

  if (!tokenMatch) {
    // No token: redirect to login for protected routes
    return new Response("", {
      status: 303,
      headers: { Location: "/login" },
    });
  }

  const token = tokenMatch[1];
  const payload = await verifyJWT(token);

  if (!payload) {
    // Invalid token: redirect to login
    return new Response("", {
      status: 303,
      headers: { Location: "/login" },
    });
  }

  // Ensure required payload fields are present and correctly typed
  if (!payload.sub || typeof payload.sub !== "string") {
    return new Response("", {
      status: 303,
      headers: { Location: "/login" },
    });
  }

  // Set user data in the context state (use safe defaults)
  ctx.state.user = {
    id: parseInt(payload.sub),
    email: typeof payload.email === "string" ? payload.email : "",
    name: typeof payload.name === "string" ? payload.name : "",
    role: typeof payload.role === "string" ? payload.role : "",
  };

  // Now that ctx.state.user is set, run the guest-write guard with the verified user
  const forbiddenResponse = forbidGuestWrites(req, ctx.state.user ?? null);
  if (forbiddenResponse) return forbiddenResponse;

  // For admin-only routes, check user role
  if (
    (url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/api/admin")) &&
    payload.role !== "admin"
  ) {
    return jsonError(403, "forbidden", "Admin role required");
  }

  return await ctx.next();
}
