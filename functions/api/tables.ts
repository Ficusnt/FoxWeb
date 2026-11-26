/**
 * GET /api/tables — List available CSV tables from KV
 * Returns [{ folder, name, path }]
 */

export const onRequestGet: PagesFunction = async ({ env }) => {
  const kv = env.TABLE_CSVS!
  const listed = await kv.list()
  const tables: Array<{ folder: string; name: string; path: string }> = []
  const seen = new Set<string>()

  for (const obj of listed.keys) {
    // Match pattern: FOLDER/NAME.csv (current files, not snapshots)
    const m = obj.name.match(/^([A-Z]+)\/([A-Z0-9_]+)\.csv$/)
    if (m && !obj.name.includes("_20")) {
      const path = obj.name
      if (!seen.has(path)) {
        seen.add(path)
        tables.push({
          folder: m[1],
          name: m[2],
          path
        })
      }
    }
  }

  tables.sort((a, b) => a.path.localeCompare(b.path))
  return Response.json({ tables })
}
