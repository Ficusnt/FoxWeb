/**
 * GET /api/input — Load saved input rows (D1 or localStorage fallback handled client-side)
 * POST /api/input — Save input rows to D1
 */

export const onRequestGet: PagesFunction = async ({ env }) => {
  const db = env.FOX_DB
  if (!db) {
    return new Response(JSON.stringify({ error: "D1 no configurado" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    })
  }

  const result = await db.prepare("SELECT date, capital FROM input_rows ORDER BY date").all()
  const rows = (result.results as Array<{ date: string; capital: number }>).map(r => ({
    date: r.date,
    capital: r.capital
  }))
  return Response.json({ rows })
}

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const db = env.FOX_DB
  if (!db) {
    return new Response(JSON.stringify({ error: "D1 no configurado" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const { rows } = (await request.json()) as { rows: Array<{ date: string; capital: number }> }

    await db.prepare("DELETE FROM input_rows").run()

    if (rows.length > 0) {
      const stmt = db.prepare("INSERT INTO input_rows (date, capital) VALUES (?, ?)")
      for (const row of rows) {
        await stmt.bind(row.date, row.capital).run()
      }
    }

    return Response.json({ ok: true, count: rows.length })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
