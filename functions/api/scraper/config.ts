/**
 * GET /api/scraper/config — Read scraper configuration from KV
 * POST /api/scraper/config — Save scraper configuration to KV
 */

import type { ScraperConfig, TableEntry } from "../../../src/types"
import { readScraperConfig, writeScraperConfig } from "../../../src/lib/scraper"

export const onRequestGet: PagesFunction = async ({ env }) => {
  const config = await readScraperConfig(env.TABLE_CONFIG)
  return Response.json(config)
}

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  try {
    const body = (await request.json()) as Partial<ScraperConfig>
    const current = await readScraperConfig(env.TABLE_CONFIG)

    const config: ScraperConfig = {
      retencion: typeof body.retencion === "number" ? body.retencion : current.retencion,
      tables: Array.isArray(body.tables) ? body.tables : current.tables
    }

    // Validate entries
    for (const t of config.tables) {
      if (!t.name || !t.url) {
        return new Response(JSON.stringify({ error: "Cada tabla necesita nombre y URL" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        })
      }
      if (!t.url.toLowerCase().startsWith("http")) {
        return new Response(JSON.stringify({ error: "URL debe comenzar con http(s)" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        })
      }
    }

    await writeScraperConfig(env.TABLE_CONFIG, config)
    return Response.json({ ok: true, message: "Configuracion guardada", config })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
