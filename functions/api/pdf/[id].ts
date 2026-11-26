/**
 * GET /api/pdf/:id — PDFs are now streamed directly from /api/pdf/generate.
 * This endpoint is kept for backward compatibility but returns 410.
 */

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ error: "PDFs se entregan directamente desde /api/pdf/generate" }), {
    status: 410,
    headers: { "Content-Type": "application/json" }
  })
}
