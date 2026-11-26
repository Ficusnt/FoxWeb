/**
 * health.ts — Health check endpoint
 */

export function handleHealth(env: any): Response {
  const checks: Record<string, boolean> = {
    table_config: !!env.TABLE_CONFIG,
    table_csvs: !!env.TABLE_CSVS,
    fox_sessions: !!env.FOX_SESSIONS,
    fox_db: !!env.FOX_DB
  }

  const ok = Object.values(checks).every(Boolean)

  return Response.json({
    ok,
    service: "fox-web",
    checks,
    timestamp: new Date().toISOString()
  }, { status: ok ? 200 : 503 })
}
