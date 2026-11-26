/**
 * GET /api/health — Health check endpoint
 */

export const onRequestGet: PagesFunction = async ({ env }) => {
  const checks: Record<string, boolean> = {
    tables_csv: !!env.TABLES_CSV,
    pdfs: !!env.PDFS,
    table_config: !!env.TABLE_CONFIG,
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
