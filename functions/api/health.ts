/**
 * GET /api/health — Health check endpoint (read-only, no auth)
 */

import { corsHeaders, jsonResponse } from "../../src/lib/auth"

export const onRequestGet: PagesFunction = async ({ env, request }) => {
  const checks: Record<string, boolean> = {
    table_config: !!env.TABLE_CONFIG,
    table_csvs: !!env.TABLE_CSVS,
    fox_sessions: !!env.FOX_SESSIONS,
    fox_db: !!env.FOX_DB
  }

  const ok = Object.values(checks).every(Boolean)

  return jsonResponse(
    {
      ok,
      service: "fox-web",
      checks,
      timestamp: new Date().toISOString()
    },
    { status: ok ? 200 : 503, origin: request.headers.get("Origin") }
  )
}

export const onRequestOptions: PagesFunction = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("Origin"))
  })
}
