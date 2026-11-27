/**
 * auth.ts — Simple Bearer-token auth for FoxWeb API routes.
 *
 * Reads API_AUTH_TOKEN from Worker env. Protected endpoints must send
 * `Authorization: Bearer <token>`. When no token is configured (dev mode),
 * all requests are allowed.
 */

export function getAuthToken(env: any): string | undefined {
  return env.API_AUTH_TOKEN
}

/**
 * Authenticate an incoming request. Returns null when authenticated (or when
 * no token is configured), or a Response with status 401 when unauthenticated.
 */
export function authenticate(request: Request, env: any): Response | null {
  const token = getAuthToken(env)
  if (!token) {
    return null
  }

  const authHeader = request.headers.get("Authorization")
  const expected = `Bearer ${token}`

  if (authHeader !== expected) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders() }
    })
  }

  return null
}

/**
 * Standard CORS headers. Echoes the request's Origin when available,
 * otherwise falls back to "*". Same-origin deployment (Pages + Functions)
 * means this is mostly defense-in-depth.
 */
export function corsHeaders(requestOrigin: string | null = null): Record<string, string> {
  const allowOrigin = requestOrigin ?? "*"
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  }
}

/**
 * Build a JSON Response with CORS headers.
 */
export function jsonResponse(
  body: unknown,
  opts: { status?: number; origin?: string | null } = {}
): Response {
  return new Response(JSON.stringify(body), {
    status: opts.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(opts.origin ?? null)
    }
  })
}
