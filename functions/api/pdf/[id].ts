/**
 * GET /api/pdf/:id — PDFs are now streamed directly from /api/pdf/generate.
 * This endpoint is kept for backward compatibility but returns 410.
 */

import { corsHeaders, jsonResponse } from "../../../src/lib/auth"

export const onRequestGet: PagesFunction = async ({ request }) => {
  return jsonResponse(
    { error: "PDFs se entregan directamente desde /api/pdf/generate" },
    { status: 410, origin: request.headers.get("Origin") }
  )
}

export const onRequestOptions: PagesFunction = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("Origin"))
  })
}
