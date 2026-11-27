/**
 * POST /api/pdf/generate — Generate a PDF report (AUTH REQUIRED)
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

import { authenticate, corsHeaders, jsonResponse } from "../../../src/lib/auth"
import { generatePdf } from "../../../src/lib/pdf"
import { fromTabla, fromPercent } from "../../../src/lib/calculation"
import { loadTableFromKV } from "../../../src/lib/calculation"
import type { InputRow } from "../../../src/types"

export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const auth = authenticate(request, env)
  if (auth) return auth

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
      return jsonResponse({ error: "No hay datos de entrada" }, {
        status: 400,
        origin: request.headers.get("Origin")
      })
    }

    const typedRows: InputRow[] = inputRows.map((r: any) => ({
      date: r.date,
      capital: r.capital
    }))

    let report: any

    if (mode === "tabla") {
      if (!tablePath) {
        return jsonResponse({ error: "Seleccione una tabla CSV" }, {
          status: 400,
          origin: request.headers.get("Origin")
        })
      }

      // Parse folder/name from path like "BCRA/BCRA_ACT_SUM.csv"
      const parts = tablePath.split("/")
      const folder = parts[0]
      const name = parts[1]?.replace(".csv", "")

      const csvMatrix = await loadTableFromKV(env.TABLE_CSVS!, folder, name!)
      if (!csvMatrix) {
        return jsonResponse({ error: "No se pudo cargar la tabla CSV" }, {
          status: 404,
          origin: request.headers.get("Origin")
        })
      }

      report = fromTabla(typedRows, csvMatrix, globalMult, outputName, admin, edif, unid)
    } else {
      const ref = refDate ? new Date(refDate) : new Date()
      report = fromPercent(typedRows, basePercent, ref, outputName, admin, edif, unid)
    }

    const pdfBytes = await generatePdf(report)

    return new Response(new Blob([pdfBytes as any]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte_${outputName}.pdf"`,
        ...corsHeaders(request.headers.get("Origin"))
      }
    })
  } catch (err: any) {
    return jsonResponse({ error: err.message || "Error interno" }, {
      status: 500,
      origin: request.headers.get("Origin")
    })
  }
}

export const onRequestOptions: PagesFunction = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("Origin"))
  })
}
