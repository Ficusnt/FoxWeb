/**
 * calculation.ts — Core calculation engine for FoxCapital.
 * Ported from fox.py (FoxReloaded).
 *
 * from_tabla: calculates using coefficient tables from CSV data.
 * from_percent: calculates using a base monthly percentage + month shift.
 */

import { normalizeDate, normalizeNumber, formatMoney, formatCoef, monthsDiff, sortByMonth, extraerYear } from "./normalization"
import type { InputRow, CalcRow, PdfReport } from "../types"

const MONTH_MAP: Record<string, string> = {
  "01": "ENE.", "02": "FEB.", "03": "MAR.", "04": "ABR.",
  "05": "MAY.", "06": "JUN.", "07": "JUL.", "08": "AGO.",
  "09": "SEP.", "10": "OCT.", "11": "NOV.", "12": "DIC."
}

/**
 * Parse a CSV string (Mes,2026,2025,...) into a matrix { month: { year: value } }.
 */
export function parseCsvMatrix(csvText: string): Record<string, Record<number, number>> {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return {}

  const header = lines[0].split(",")
  const years = header.slice(1).map(h => parseInt(h.trim(), 10)).filter(y => !isNaN(y))

  const data: Record<string, Record<number, number>> = {}

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",")
    const month = cols[0]?.trim()
    if (!month) continue

    data[month] = {}
    for (let j = 0; j < years.length; j++) {
      const val = cols[j + 1]?.trim()
      if (val && val !== "") {
        const parsed = parseEsNumber(val)
        if (parsed !== null) {
          data[month][years[j]] = parsed
        }
      }
    }
  }

  return data
}

/**
 * Parse an Argentine-formatted number string to float.
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
 * from_tabla mode: calculate interest using coefficient tables.
 *
 * inputRows: [{ date: "MM/YY", capital: number }]
 * csvMatrix: parsed CSV matrix { month: { year: coef } }
 * globalMult: multiplier applied to (coef - 1) + 1
 * admin, edif, unid: report metadata
 * outputName: filename for the PDF
 */
export function fromTabla(
  inputRows: InputRow[],
  csvMatrix: Record<string, Record<number, number>>,
  globalMult: number,
  outputName: string,
  admin = "",
  edif = "",
  unid = ""
): PdfReport {
  const calcDate = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).replace(/\//g, "/")

  const tablaName = outputName || "Reporte"

  const rows: CalcRow[] = []
  const errors: Record<number, string> = {}
  let totalCapital = 0
  let totalInteres = 0
  let totalFinal = 0

  for (let idx = 0; idx < inputRows.length; idx++) {
    const { date, capital } = inputRows[idx]
    const [mm, yy] = date.split("/")
    const year = 2000 + parseInt(yy, 10)
    const month = MONTH_MAP[mm]

    if (!month || !csvMatrix[month] || csvMatrix[month][year] === undefined) {
      errors[idx] = "ERROR DE FECHA"
      rows.push({
        date,
        capital: formatMoney(capital),
        coeficiente: "",
        coef_con_mult: "",
        interes: "",
        final: ""
      })
      continue
    }

    const coeficiente = csvMatrix[month][year]
    const coefConMult = (coeficiente - 1) * globalMult + 1
    const final = capital * coefConMult
    const interes = final - capital

    totalCapital += capital
    totalInteres += interes
    totalFinal += final

    rows.push({
      date,
      capital: formatMoney(capital),
      coeficiente: formatCoef(coeficiente),
      coef_con_mult: formatCoef(coefConMult),
      interes: formatMoney(interes),
      final: formatMoney(final)
    })
  }

  return {
    title: `Tabla: ${tablaName}`,
    meta: [
      `Administracion: ${admin}`,
      `Edificio/Calle: ${edif}`,
      `Unidad: ${unid}`,
      `Fecha de calculo: ${calcDate}`
    ],
    headers: ["FECHA", "CAPITAL", "COEF", `MULT [${globalMult.toFixed(2)}]`, "INTERES", "CAPITAL + INT"],
    rows,
    totals: totalCapital > 0 || rows.length > 0
      ? ["TOTAL", formatMoney(totalCapital), "", "", formatMoney(totalInteres), formatMoney(totalFinal)]
      : null,
    align: ["l", "r", "r", "r", "r", "r"],
    errors
  }
}

/**
 * from_percent mode: calculate interest using base monthly percentage.
 */
export function fromPercent(
  inputRows: InputRow[],
  basePercent: number,
  refDate: Date,
  outputName: string,
  admin = "",
  edif = "",
  unid = ""
): PdfReport {
  const rows: CalcRow[] = []
  let totalImporte = 0
  let totalInteres = 0
  let totalFinal = 0

  for (const { date, capital } of inputRows) {
    const diff = monthsDiff(date, refDate)
    const percent = diff * basePercent
    const interes = capital * (percent / 100)
    const final = capital + interes

    totalImporte += capital
    totalInteres += interes
    totalFinal += final

    rows.push({
      date,
      capital: formatMoney(capital),
      coeficiente: `${percent.toFixed(2)}`,
      coef_con_mult: "",
      interes: formatMoney(interes),
      final: formatMoney(final)
    })
  }

  const calcDate = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).replace(/\//g, "/")

  return {
    title: "Calculo por porcentaje",
    meta: [
      `Administracion: ${admin}`,
      `Edificio/Calle: ${edif}`,
      `Unidad: ${unid}`,
      `Base: ${basePercent.toFixed(2)}%`,
      `Fecha de referencia: ${refDate.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })}`
    ],
    headers: ["FECHA", "CAPITAL", "%", "INTERES", "CAPITAL + INT"],
    rows,
    totals: totalImporte > 0 || rows.length > 0
      ? ["TOTAL", formatMoney(totalImporte), "", formatMoney(totalInteres), formatMoney(totalFinal)]
      : null,
    align: ["l", "r", "r", "r", "r"],
    errors: {}
  }
}

/**
 * Build a CSV matrix from KV-stored table files.
 * Given a folder and name, fetch the CSV from KV and parse it.
 */
export async function loadTableFromKV(
  kv: KVNamespace,
  folder: string,
  name: string
): Promise<Record<string, Record<number, number>> | null> {
  try {
    const text = await kv.get(`${folder}/${name}.csv`)
    if (!text) return null
    return parseCsvMatrix(text)
  } catch {
    return null
  }
}
