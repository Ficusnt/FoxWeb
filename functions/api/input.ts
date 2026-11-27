/**
 * GET /api/input — Load saved input rows (D1 or localStorage fallback handled client-side)
 * POST /api/input — Save input rows to D1 (AUTH REQUIRED on write)
 */

import { authenticate, corsHeaders, jsonResponse } from "../../src/lib/auth"

export const onRequestGet: PagesFunction = async ({ env, request }) => {
  const db = env.FOX_DB
  if (!db) {
    return jsonResponse({ error: "D1 no configurado" }, {
      status: 503,
      origin: request.headers.get("Origin")
    })
  }

  const result = await db.prepare("SELECT date, capital FROM input_rows ORDER BY date").all()
  const rows = (result.results as Array<{ date: string; capital: number }>).map(r => ({
    date: r.date,
    capital: r.capital
  }))
  return jsonResponse({ rows }, { origin: request.headers.get("Origin") })
}

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const auth = authenticate(request, env)
  if (auth) return auth

  const db = env.FOX_DB
  if (!db) {
    return jsonResponse({ error: "D1 no configurado" }, {
      status: 503,
      origin: request.headers.get("Origin")
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

    return jsonResponse({ ok: true, count: rows.length }, {
      origin: request.headers.get("Origin")
    })
  } catch (err: any) {
    return jsonResponse({ error: err.message }, { status: 500, origin: request.headers.get("Origin") })
  }
}

export const onRequestOptions: PagesFunction = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("Origin"))
  })
}
