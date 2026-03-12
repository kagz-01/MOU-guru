// utils/guards.ts
// Small reusable guards for middleware and route handlers.

export function jsonError(status: number, error: string, message: string) {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Return a Response when the request should be forbidden for guests/unauthenticated users.
 * Returns null when the request is allowed to continue.
 */
export function forbidGuestWrites(
  req: Request,
  user: { id: number } | null,
): Response | null {
  const method = req.method.toUpperCase();
  const writeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

  if (!writeMethods.has(method)) return null;

  const url = new URL(req.url);
  const isGuestExplicit = url.searchParams.get("guest") === "true";

  // If the request is a write method and either explicitly a guest request
  // or there is no authenticated user, block it.
  if (isGuestExplicit || !user) {
    return jsonError(
      403,
      "forbidden",
      "guest or unauthenticated users cannot perform write operations",
    );
  }

  return null;
}

// Early guard to ensure explicit guest writes always return JSON 403 instead of a login redirect
export function forbidExplicitGuestWritesEarly(req: Request): Response | null {
  const method = req.method.toUpperCase();
  const writeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
  if (!writeMethods.has(method)) return null;

  const url = new URL(req.url);
  if (url.searchParams.get("guest") === "true") {
    return jsonError(
      403,
      "forbidden",
      "Guest sessions cannot perform write operations",
    );
  }
  return null;
}
