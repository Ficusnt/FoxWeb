/**
 * GET /api/tables/:folder/:name — Download a specific CSV table from KV (read-only, no auth)
 */

import { corsHeaders, jsonResponse } from "../../../../src/lib/auth"

export const onRequestGet: PagesFunction = async ({ env, params, request }) => {
  const folder = params.folder as string
  const name = params.name as string

  const content = await env.TABLE_CSVS!.get(`${folder}/${name}.csv`)
  if (!content) {
    return jsonResponse({ error: "Tabla no encontrada" }, {
      status: 404,
      origin: request.headers.get("Origin")
    })
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`,
      ...corsHeaders(request.headers.get("Origin"))
    }
  })
}

export const onRequestOptions: PagesFunction = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("Origin"))
  })
}
