/**
 * normalization.ts — Date, number, and money normalization utilities.
 * Ported from fox.py (FoxReloaded).
 */

// Spanish month abbreviations with trailing dot as used in agendae CSVs
const MESES_ABBR = ["ENE.", "FEB.", "MAR.", "ABR.", "MAY.", "JUN.",
                    "JUL.", "AGO.", "SEP.", "OCT.", "NOV.", "DIC."]

const MONTH_MAP: Record<string, string> = {
  "01": "ENE.", "ENE": "ENE.", "ENERO": "ENE.",
  "02": "FEB.", "FEB": "FEB.", "FEBRERO": "FEB.",
  "03": "MAR.", "MAR": "MAR.", "MARZO": "MAR.",
  "04": "ABR.", "ABR": "ABR.", "ABRIL": "ABR.",
  "05": "MAY.", "MAY": "MAY.", "MAYO": "MAY.",
  "06": "JUN.", "JUN": "JUN.", "JUNIO": "JUN.",
  "07": "JUL.", "JUL": "JUL.", "JULIO": "JUL.",
  "08": "AGO.", "AGO": "AGO.", "AGOSTO": "AGO.",
  "09": "SEP.", "SEP": "SEP.", "SEPTIEMBRE": "SEP.",
  "10": "OCT.", "OCT": "OCT.", "OCTUBRE": "OCT.",
  "11": "NOV.", "NOV": "NOV.", "NOVIEMBRE": "NOV.",
  "12": "DIC.", "DIC": "DIC.", "DICIEMBRE": "DIC."
}

/**
 * Normalize a date string to MM/YY format.
 * Accepts MM/YY, MM-YY, or month abbreviations (ENE, FEB, etc.)
 */
export function normalizeDate(dateRaw: string): string {
  let raw = dateRaw.trim().toUpperCase()

  let mm: string
  let yy: string

  if (raw.includes("/")) {
    ;[mm, yy] = raw.split("/")
  } else if (raw.includes("-")) {
    ;[mm, yy] = raw.split("-")
  } else {
    throw new Error("Formato de fecha invalido")
  }

  mm = mm.trim()
  yy = yy.trim()

  if (!mm.match(/^\d+$/)) {
    const key = mm.replace(".", "")
    const mapped = MONTH_MAP[key]
    if (!mapped) throw new Error("Mes invalido")
    mm = mapped
    // Find the numeric key for this month value
    for (const [k, v] of Object.entries(MONTH_MAP)) {
      if (v === mapped && k.match(/^\d{1,2}$/)) {
        mm = k
        break
      }
    }
  }

  if (mm.length === 1) mm = "0" + mm

  return `${mm}/${yy}`
}

/**
 * Normalize an Argentine-formatted number string to a float.
 * Handles "1.500,50" (dots as thousands, comma as decimal)
 * and "1500,50" or "1500.50"
 */
export function normalizeNumber(numRaw: string): number {
  let s = numRaw.trim().replace(/"/g, "")

  if (s.includes(",") && s.includes(".")) {
    // Both present: dot = thousands separator
    s = s.replace(/\./g, "").replace(",", ".")
  } else {
    s = s.replace(",", ".")
  }

  const val = parseFloat(s)
  if (isNaN(val)) throw new Error("Valor numerico invalido")
  return val
}

/**
 * Format a number as Argentine money: $1.500,50
 */
export function formatMoney(val: number): string {
  const s = val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  // "1,500.50" -> "1.500,50"
  const formatted = s.replace(/,/g, "X").replace(/\./g, ",").replace(/X/g, ".")
  return `$${formatted}`
}

/**
 * Format a coefficient to 3 decimals with comma: "1,234"
 */
export function formatCoef(v: number | null): string {
  if (v === null || v === undefined) return ""
  return v.toFixed(3).replace(".", ",")
}

/**
 * Calculate months difference between a date string (MM/YY) and a reference date.
 */
export function monthsDiff(dateStr: string, ref?: Date): number {
  const [mm, yy] = dateStr.split("/")
  const year = 2000 + parseInt(yy, 10)
  const month = parseInt(mm, 10)

  const reference = ref || new Date()
  return (reference.getFullYear() - year) * 12 + (reference.getMonth() + 1 - month)
}

/**
 * Sort rows by date ascending (oldest -> newest).
 */
export function sortByMonth(rows: [string, number][]): [string, number][] {
  return [...rows].sort((a, b) => {
    const [am, ay] = a[0].split("/")
    const [bm, by] = b[0].split("/")
    const ya = 2000 + parseInt(ay, 10)
    const yb = 2000 + parseInt(by, 10)
    if (ya !== yb) return ya - yb
    return parseInt(am, 10) - parseInt(bm, 10)
  })
}

/**
 * Normalize a month name abbreviation (e.g. "ENE.") to canonical "ENE."
 */
export function normalizarMes(texto: string): string | null {
  const up = texto.toUpperCase().replace(/[^A-Z]/g, "")
  for (const abbr of MESES_ABBR) {
    if (up.startsWith(abbr.replace(".", ""))) return abbr
  }
  return null
}

/**
 * Extract a 4-digit year (1990-2100) from a cell value.
 */
export function extraerYear(celda: string | number): number | null {
  const s = String(celda).trim()
  if (/^\d{4}$/.test(s)) {
    const y = parseInt(s, 10)
    if (y >= 1990 && y <= 2100) return y
  }
  return null
}
