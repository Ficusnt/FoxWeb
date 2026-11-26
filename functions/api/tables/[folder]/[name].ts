/**
 * GET /api/tables/:folder/:name — Download a specific CSV table from KV
 */

export const onRequestGet: PagesFunction = async ({ env, params }) => {
  const folder = params.folder as string
  const name = params.name as string

  const content = await env.TABLE_CSVS!.get(`${folder}/${name}.csv`)
  if (!content) {
    return new Response(JSON.stringify({ error: "Tabla no encontrada" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    })
  }

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`
    }
  })
}
