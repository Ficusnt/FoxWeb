/**
 * api.ts — Frontend API client with auth.
 *
 * Reads VITE_API_AUTH_TOKEN from Vite env (baked at build time) and sends it
 * as a Bearer token on every request. Configure it in Cloudflare Pages env
 * vars for production, or in a local .env for development.
 */

const API_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN ?? ""

function headers(): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" }
  if (API_TOKEN) {
    ;(h as Record<string, string>)["Authorization"] = `Bearer ${API_TOKEN}`
  }
  return h
}

export async function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: {
      ...headers(),
      ...(init.headers ?? {})
    }
  })
}
