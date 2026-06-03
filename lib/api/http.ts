/**
 * Tiny response helpers shared by the route handlers. Uses the web-standard
 * `Response.json` so there's no dependency on next/server.
 */

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function unauthorized(): Response {
  return Response.json({ error: "Not authenticated" }, { status: 401 });
}

export function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found"): Response {
  return Response.json({ error: message }, { status: 404 });
}

export function serverError(message: string): Response {
  return Response.json({ error: message }, { status: 500 });
}
