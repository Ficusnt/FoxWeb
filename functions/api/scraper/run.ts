/**
 * POST /api/scraper/run — Run the scraper against agendae.com.ar (AUTH REQUIRED)
 * Requires AGENDAE_USUARIO, AGENDAE_PASSWORD, AGENDAE_URL secrets.
 */

import { authenticate, corsHeaders, jsonResponse } from "../../../src/lib/auth"
import { runScrape } from "../../../src/lib/scraper"

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const auth = authenticate(request, env)
  if (auth) return auth

  try {
    const result = await runScrape({
      AGENDAE_USUARIO: env.AGENDAE_USUARIO!,
      AGENDAE_PASSWORD: env.AGENDAE_PASSWORD!,
      AGENDAE_URL: env.AGENDAE_URL!,
      TABLE_CSVS: env.TABLE_CSVS!,
      TABLE_CONFIG: env.TABLE_CONFIG!
    })

    return jsonResponse(result, {
      status: result.ok ? 200 : 207,
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
