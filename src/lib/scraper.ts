/**
 * scraper.ts — Actualiza las tablas de FoxCapital desde agendae.com.ar.
 * Ported from scraper.py (FoxReloaded).
 *
 * Runs server-side only (Cloudflare Workers). Handles login via _login.aspx
 * and table fetch via _back.aspx AJAX endpoint.
 */

import { normalizarMes, extraerYear, formatCoef } from "./normalization"
import type { TableEntry, ScraperConfig, CoefficientMatrix } from "../types"

const LOGIN_ENDPOINT = "_login.aspx"
const BACK_ENDPOINT = "_back.aspx"

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

/**
 * Build form-encoded body from an object.
 */
function formEncode(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&")
}

/**
 * Create a base fetch init with common headers.
 */
function baseInit(init: RequestInit = {}): RequestInit {
  return {
    headers: {
      "User-Agent": USER_AGENT,
      ...(init.headers || {})
    },
    ...init
  }
}

/**
 * Simple cookie jar for maintaining session across fetch calls.
 * Workers have no built-in cookie jar, so we track Set-Cookie manually.
 */
class CookieJar {
  private cookies: Map<string, string> = new Map()

  setFromResponse(headers: Headers): void {
    const setCookie = headers.get("Set-Cookie")
    if (!setCookie) return
    // Handle multiple Set-Cookie headers (Workers combines them with comma)
    const cookies = setCookie.split(", ")
    for (const c of cookies) {
      const match = c.match(/^([^=]+)=([^;]*);?/)
      if (match) {
        this.cookies.set(match[1], match[2])
      }
    }
  }

  getHeader(): string | null {
    if (this.cookies.size === 0) return null
    return [...this.cookies.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join("; ")
  }
}

/**
 * Authenticate via the AJAX endpoint (_login.aspx).
 * Returns true on success.
 */
export async function login(
  baseUrl: string,
  usuario: string,
  password: string,
  jar: CookieJar
): Promise<boolean> {
  const url = baseUrl.replace(/\/$/, "") + "/" + LOGIN_ENDPOINT
  const data = {
    accion: "LOGIN",
    usuario,
    password,
    entidad: ""
  }

  const resp = await fetch(url, {
    ...baseInit({
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": baseUrl
      },
      body: formEncode(data)
    }),
    redirect: "manual"
  })

  jar.setFromResponse(resp.headers)

  const text = await resp.text()
  return text.trim().startsWith("OK")
}

/**
 * Check if the session has access to a table page (not redirected to noacceso).
 */
export async function tieneAcceso(
  baseUrl: string,
  pageUrl: string,
  jar: CookieJar
): Promise<boolean> {
  try {
    const cookieHeader = jar.getHeader()
    const headers: Record<string, string> = {}
    if (cookieHeader) headers["Cookie"] = cookieHeader

    const resp = await fetch(pageUrl, {
      ...baseInit({ headers }),
      redirect: "manual"
    })
    jar.setFromResponse(resp.headers)
    return !resp.url.includes("noacceso")
  } catch {
    return false
  }
}

/**
 * Fetch table JSON from _back.aspx.
 * Requires an authenticated session and that pageUrl has been visited (Referer).
 */
export async function fetchTablaJson(
  baseUrl: string,
  pageUrl: string,
  idct: number,
  jar: CookieJar
): Promise<CoefficientMatrix> {
  const url = baseUrl.replace(/\/$/, "") + "/" + BACK_ENDPOINT
  const data = {
    page: "1",
    pageLimit: "0",
    searchRecord: "",
    sortName: "",
    sortOrder: "",
    tipoEntidad: "COEFICIENTES",
    exportar: "",
    from_admin: "N",
    idct: String(idct)
  }

  const cookieHeader = jar.getHeader()
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": pageUrl,
    "X-Requested-With": "XMLHttpRequest"
  }
  if (cookieHeader) headers["Cookie"] = cookieHeader

  const resp = await fetch(url, {
    ...baseInit({
      method: "POST",
      headers,
      body: formEncode(data)
    }),
    redirect: "manual"
  })
  jar.setFromResponse(resp.headers)

  const respText = (await resp.text()).trim()
  if (respText.startsWith("ERROR")) {
    throw new Error(`_back.aspx devolvio error: ${respText}`)
  }

  let payload: any
  try {
    payload = JSON.parse(respText)
  } catch {
    throw new Error("_back.aspx no devolvio JSON valido")
  }

  const headings = payload.dt?.headings ?? []
  const rows = payload.dt?.data ?? []

  const years: [number, number][] = []
  headings.forEach((h: string, idx: number) => {
    const y = extraerYear(h)
    if (y !== null) years.push([idx, y])
  })

  if (years.length === 0) throw new Error("el JSON no contiene columnas de ano")

  const matrix: CoefficientMatrix = {}

  for (const row of rows) {
    if (!row || !Array.isArray(row)) continue
    const mes = normalizarMes(String(row[0] ?? ""))
    if (!mes) continue

    if (!matrix[mes]) matrix[mes] = {}

    for (const [idx, year] of years) {
      if (idx < row.length) {
        const val = parseEsNumber(String(row[idx] ?? ""))
        if (val !== null) {
          matrix[mes][year] = val
        }
      }
    }
  }

  if (Object.keys(matrix).length === 0) {
    throw new Error("el JSON no contiene filas de meses")
  }

  return matrix
}

/**
 * Parse an Argentine-formatted number string.
 */
function parseEsNumber(s: string): number | null {
  s = (s || "").trim().replace(/"/g, "")
  if (!s) return null
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", ".")
  } else {
    s = s.replace(",", ".")
  }
  const val = parseFloat(s)
  return isNaN(val) ? null : val
}

/**
 * Best (year, month) key present in the data matrix.
 */
function bestKey(matrix: CoefficientMatrix): [number, number] | null {
  const MESES_ORDER = ["ENE.", "FEB.", "MAR.", "ABR.", "MAY.", "JUN.",
                       "JUL.", "AGO.", "SEP.", "OCT.", "NOV.", "DIC."]
  let best: [number, number] | null = null
  for (const [mes, entries] of Object.entries(matrix)) {
    const mesIdx = MESES_ORDER.indexOf(mes)
    if (mesIdx === -1) continue
    for (const [year] of Object.entries(entries)) {
      const y = parseInt(year, 10)
      const key: [number, number] = [y, mesIdx]
      if (!best || key[0] > best[0] || (key[0] === best[0] && key[1] > best[1])) {
        best = key
      }
    }
  }
  return best
}

/**
 * Format a matrix as CSV string: Mes,2026,2025,...
 */
export function matrixToCsv(matrix: CoefficientMatrix): string {
  const MESES = ["ENE.", "FEB.", "MAR.", "ABR.", "MAY.", "JUN.",
                 "JUL.", "AGO.", "SEP.", "OCT.", "NOV.", "DIC."]
  const years = new Set<number>()
  for (const entries of Object.values(matrix)) {
    for (const year of Object.keys(entries)) {
      years.add(parseInt(year, 10))
    }
  }
  const sortedYears = [...years].sort((a, b) => b - a)

  const lines: string[] = []
  lines.push(["Mes", ...sortedYears.map(String)].join(","))

  for (const mes of MESES) {
    const entries = matrix[mes] ?? {}
    const row = [mes] + sortedYears.map(y => formatCoef(entries[y]))
    lines.push(row.join(","))
  }

  return lines.join("\n")
}

/**
 * Main scrape routine: login, fetch all tables, save to KV.
 * Returns summary of results per table.
 */
export async function runScrape(
  env: {
    AGENDAE_USUARIO: string
    AGENDAE_PASSWORD: string
    AGENDAE_URL: string
    TABLE_CSVS: KVNamespace
    TABLE_CONFIG: KVNamespace
  }
): Promise<{ ok: boolean; message: string; results: Array<{ name: string; status: string }> }> {
  const jar = new CookieJar()
  const baseUrl = env.AGENDAE_URL.replace(/\/$/, "")

  // Load config from KV
  const configRaw = await env.TABLE_CONFIG.get("config")
  let config: ScraperConfig
  if (configRaw) {
    config = JSON.parse(configRaw)
  } else {
    config = { retencion: 6, tables: [] }
  }

  if (config.tables.length === 0) {
    return {
      ok: false,
      message: "No hay tablas configuradas en TABLAS/config.txt",
      results: []
    }
  }

  // Login
  const loggedIn = await login(baseUrl, env.AGENDAE_USUARIO, env.AGENDAE_PASSWORD, jar)
  if (!loggedIn) {
    return {
      ok: false,
      message: "Login rechazado por agendae.com.ar (credenciales invalidas)",
      results: []
    }
  }

  // Fetch all tables concurrently
  const results = await Promise.all(
    config.tables.map(t => scrapeTable(env.TABLE_CSVS, jar, baseUrl, t, config.retencion))
  )

  return {
    ok: results.every(r => r.status === "guardado"),
    message: "Proceso de actualizacion finalizado",
    results
  }
}

/**
 * Fetch a single table: visit page, fetch JSON via _back.aspx, save CSV to KV,
 * handle snapshot rotation, and apply retention. Returns a status result.
 */
async function scrapeTable(
  kv: KVNamespace,
  jar: CookieJar,
  baseUrl: string,
  t: TableEntry,
  retencion: number
): Promise<{ name: string; status: string }> {
  const folder = t.name.split("_", 1)[0].toUpperCase()
  const m = t.url.match(/[?&]t=(\d+)/)
  if (!m) {
    return { name: t.name, status: "omitido (sin parametro ?t=N)" }
  }
  const idct = parseInt(m[1], 10)

  try {
    // Visit table page first (sets Referer + session state)
    const pageResp = await fetch(t.url, {
      ...baseInit({
        headers: { Cookie: jar.getHeader() ?? "" }
      }),
      redirect: "manual"
    })
    jar.setFromResponse(pageResp.headers)

    if (pageResp.url.includes("noacceso")) {
      return { name: t.name, status: "sin acceso" }
    }

    const data = await fetchTablaJson(baseUrl, t.url, idct, jar)
    const csv = matrixToCsv(data)

    // Save current CSV to KV
    const currentPath = `${folder}/${t.name}.csv`
    await kv.put(currentPath, csv)

    // Handle snapshot rotation: if month changed, move current to snapshot
    const best = bestKey(data)
    const nuevoMes = best ? `${best[0]}-${best[1] + 1}` : null

    if (nuevoMes) {
      const existingRaw = await kv.get(currentPath)
      if (existingRaw) {
        const oldMes = leerRepresentacionFromCsv(existingRaw)
        if (oldMes && oldMes !== nuevoMes) {
          const snapPath = `${folder}/${t.name}_${oldMes}.csv`
          await kv.put(snapPath, existingRaw)
        }
      }
    }

    // Apply retention: prune old snapshots from KV
    await aplicarRetencionKV(kv, folder, t.name, retencion)

    return { name: t.name, status: "guardado" }
  } catch (err: any) {
    return { name: t.name, status: `error: ${err.message}` }
  }
}

/**
 * Extract last (year-month) with data from a CSV text string.
 */
function leerRepresentacionFromCsv(csvText: string): string | null {
  const MESES = ["ENE.", "FEB.", "MAR.", "ABR.", "MAY.", "JUN.",
                 "JUL.", "AGO.", "SEP.", "OCT.", "NOV.", "DIC."]
  const lines = csvText.split("\n")
  if (lines.length < 2) return null

  const header = lines[0].split(",")
  const years: number[] = header.slice(1).map(h => parseInt(h.trim(), 10)).filter(y => !isNaN(y))

  let best: [number, number] | null = null
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",")
    const mes = cols[0]?.replace(".", "").trim()
    const mesIdx = MESES.indexOf(mes)
    if (mesIdx === -1) continue
    for (let j = 0; j < years.length; j++) {
      const val = cols[j + 1]?.trim()
      if (val && val !== "") {
        const key: [number, number] = [years[j], mesIdx]
        if (!best || key[0] > best[0] || (key[0] === best[0] && key[1] > best[1])) {
          best = key
        }
      }
    }
  }

  if (!best) return null
  return `${best[0]}-${best[1] + 1}`
}

/**
 * Prune old snapshots from KV beyond retention count.
 * Lists keys with prefix FOLDER/ and deletes NAME_YYYY-MM.csv entries beyond retention.
 */
async function aplicarRetencionKV(
  kv: KVNamespace,
  folder: string,
  name: string,
  retencion: number
): Promise<void> {
  const prefix = `${folder}/`
  const snapshots: Array<{ key: string; date: string }> = []

  let cursor: string | undefined = undefined
  do {
    const listed = await kv.list({ prefix, cursor, limit: 1000 })
    const pattern = new RegExp(`^${folder}/${name}_(\\d{4})-(\\d{2})\\.csv$`)

    for (const obj of listed.keys) {
      const m = obj.name.match(pattern)
      if (m) {
        snapshots.push({ key: obj.name, date: `${m[1]}-${m[2]}` })
      }
    }

    cursor = listed.list_complete ? undefined : listed.cursor
  } while (cursor)

  snapshots.sort((a, b) => b.date.localeCompare(a.date))

  for (const s of snapshots.slice(retencion)) {
    await kv.delete(s.key)
  }
}

/**
 * Read scraper config from KV.
 */
export async function readScraperConfig(
  kv: KVNamespace
): Promise<ScraperConfig> {
  const raw = await kv.get("config")
  if (!raw) return { retencion: 6, tables: [] }
  return JSON.parse(raw)
}

/**
 * Write scraper config to KV.
 */
export async function writeScraperConfig(
  kv: KVNamespace,
  config: ScraperConfig
): Promise<void> {
  await kv.put("config", JSON.stringify(config, null, 2))
}
