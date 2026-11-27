/**
 * GET /api/scraper/config — Read scraper configuration from KV (read-only, no auth)
 * POST /api/scraper/config — Save scraper configuration to KV (AUTH REQUIRED)
 */

import { authenticate, corsHeaders, jsonResponse } from "../../../src/lib/auth"
import type { ScraperConfig } from "../../../src/types"
import { readScraperConfig, writeScraperConfig } from "../../../src/lib/scraper"

export const onRequestGet: PagesFunction = async ({ env, request }) => {
  const config = await readScraperConfig(env.TABLE_CONFIG)
  return jsonResponse(config, { origin: request.headers.get("Origin") })
}

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const auth = authenticate(request, env)
  if (auth) return auth

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
        return jsonResponse({ error: "Cada tabla necesita nombre y URL" }, {
          status: 400,
          origin: request.headers.get("Origin")
        })
      }
      if (!t.url.toLowerCase().startsWith("http")) {
        return jsonResponse({ error: "URL debe comenzar con http(s)" }, {
          status: 400,
          origin: request.headers.get("Origin")
        })
      }
    }

    await writeScraperConfig(env.TABLE_CONFIG, config)
    return jsonResponse({ ok: true, message: "Configuracion guardada", config }, {
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
