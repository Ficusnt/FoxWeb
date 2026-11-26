/**
 * POST /api/pdf/generate — Generate a PDF report
 *
 * Body:
 *   { inputRows: [{date, capital}], mode: "tabla"|"porcentaje",
 *     tablePath?: string, globalMult?: number,
 *     basePercent?: number, refDate?: string,
 *     admin?: string, edif?: string, unid?: string, outputName?: string }
 *
 * Server fetches the CSV from KV, performs the calculation, generates the PDF,
 * and streams it directly as the HTTP response.
 */

import { generatePdf } from "../../../src/lib/pdf"
import { fromTabla, fromPercent } from "../../../src/lib/calculation"
import { loadTableFromKV } from "../../../src/lib/calculation"
import type { InputRow } from "../../../src/types"

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  try {
    const body = (await request.json()) as any
    const {
      inputRows,
      mode = "tabla",
      tablePath,
      globalMult = 1,
      basePercent = 5,
      refDate,
      admin = "",
      edif = "",
      unid = "",
      outputName = "Reporte"
    } = body

    if (!inputRows || !Array.isArray(inputRows) || inputRows.length === 0) {
      return new Response(JSON.stringify({ error: "No hay datos de entrada" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const typedRows: InputRow[] = inputRows.map((r: any) => ({
      date: r.date,
      capital: r.capital
    }))

    let report: any

    if (mode === "tabla") {
      if (!tablePath) {
        return new Response(JSON.stringify({ error: "Seleccione una tabla CSV" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        })
      }

      // Parse folder/name from path like "BCRA/BCRA_ACT_SUM.csv"
      const parts = tablePath.split("/")
      const folder = parts[0]
      const name = parts[1]?.replace(".csv", "")

      const csvMatrix = await loadTableFromKV(env.TABLE_CSVS!, folder, name!)
      if (!csvMatrix) {
        return new Response(JSON.stringify({ error: "No se pudo cargar la tabla CSV" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        })
      }

      report = fromTabla(typedRows, csvMatrix, globalMult, outputName, admin, edif, unid)
    } else {
      const ref = refDate ? new Date(refDate) : new Date()
      report = fromPercent(typedRows, basePercent, ref, outputName, admin, edif, unid)
    }

    const pdfBytes = await generatePdf(report)

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte_${outputName}.pdf"`
      }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
