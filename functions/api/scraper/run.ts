/**
 * POST /api/scraper/run — Run the scraper against agendae.com.ar
 * Requires AGENDAE_USUARIO, AGENDAE_PASSWORD, AGENDAE_URL secrets.
 */

import { runScrape } from "../../../src/lib/scraper"

export const onRequestPost: PagesFunction = async ({ env }) => {
  try {
    const result = await runScrape({
      AGENDAE_USUARIO: env.AGENDAE_USUARIO!,
      AGENDAE_PASSWORD: env.AGENDAE_PASSWORD!,
      AGENDAE_URL: env.AGENDAE_URL!,
      TABLE_CSVS: env.TABLE_CSVS!,
      TABLE_CONFIG: env.TABLE_CONFIG!
    })

    return Response.json(result, { status: result.ok ? 200 : 207 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
