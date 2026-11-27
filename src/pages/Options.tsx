import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Percent, ArrowLeft } from "lucide-react"
import Layout from "../components/Layout"
import { apiFetch } from "../lib/api"

type TableFile = { folder: string; name: string; path: string }

export default function Options() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<"tabla" | "porcentaje">("tabla")
  const [tables, setTables] = useState<TableFile[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [multiplier, setMultiplier] = useState("1")
  const [percent, setPercent] = useState("5")
  const [shift, setShift] = useState("0")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    apiFetch("/api/tables")
      .then(r => r.json())
      .then((data: any) => setTables(data.tables ?? []))
      .catch(() => {})
  }, [])

  const savedRows: Array<{ date: string; capital: number }> =
    JSON.parse(localStorage.getItem("fox_input_rows") || "[]")
  const hasRows = savedRows.length > 0

  const handleGenerate = async () => {
    if (!hasRows) {
      setMessage("No hay datos cargados. Vaya a Datos primero.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const payload: any = {
        inputRows: savedRows,
        admin: "",
        edif: "",
        unid: "",
        outputName: "Reporte"
      }

      if (mode === "tabla") {
        if (!selectedTable) {
          setMessage("Seleccione un CSV.")
          return
        }
        const mult = parseFloat(multiplier.replace(",", "."))
        if (isNaN(mult)) {
          setMessage("El multiplicador debe ser un número.")
          return
        }
        payload.mode = "tabla"
        payload.globalMult = mult
        payload.tablePath = selectedTable
      } else {
        const pct = parseFloat(percent.replace(",", "."))
        if (isNaN(pct)) {
          setMessage("Ingrese un porcentaje válido.")
          return
        }
        const shiftVal = parseInt(shift, 10) || 0
        const today = new Date()
        const totalMonths = today.getFullYear() * 12 + (today.getMonth() + 1) + shiftVal
        const refYear = Math.floor(totalMonths / 12)
        const refMonth = ((totalMonths - 1) % 12) + 1
        const refDate = new Date(refYear, refMonth - 1, 1)

        payload.mode = "porcentaje"
        payload.basePercent = pct
        payload.refDate = refDate.toISOString()
      }

      const resp = await apiFetch("/api/pdf/generate", {
        method: "POST",
        body: JSON.stringify(payload)
      })

      if (resp.ok) {
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `reporte_${Date.now()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        const result = await resp.json()
        setMessage(`Error: ${result.error}`)
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-fox-ink mb-1">Generar reporte</h1>
            <p className="text-sm text-gray-500">Seleccione el modo de cálculo</p>
          </div>
          <button
            onClick={() => navigate("/editor")}
            className="btn btn-ghost"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode("tabla")}
            className={`btn btn-primary flex-1 ${mode === "tabla" ? "bg-fox-blue text-white border-fox-blue" : ""}`}
          >
            <FileText size={18} className="mr-2" />
            Tablas (CSV)
          </button>
          <button
            onClick={() => setMode("porcentaje")}
            className={`btn btn-primary flex-1 ${mode === "porcentaje" ? "bg-fox-blue text-white border-fox-blue" : ""}`}
          >
            <Percent size={18} className="mr-2" />
            Porcentaje
          </button>
        </div>

        <div className="fox-card mb-6">
          {mode === "tabla" ? (
            <>
              <div className="px-6 py-4">
                <h3 className="text-lg font-display font-bold text-fox-ink mb-4">Seleccionar tabla (CSV)</h3>
                {tables.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    No se encontraron archivos CSV. Ejecute el scraper primero.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-fox-rule bg-gray-50 p-2">
                    {tables.map(t => (
                      <button
                        key={t.path}
                        onClick={() => setSelectedTable(t.path)}
                        className={`w-full text-left px-3 py-2 rounded-none border text-left transition text-sm ${
                          selectedTable === t.path ? "bg-blue-50 border-blue-300 text-blue-700 font-medium" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {t.path}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-fox-rule">
                <label className="fox-label">Multiplicador global</label>
                <input
                  className="fox-input w-24"
                  value={multiplier}
                  onChange={e => setMultiplier(e.target.value)}
                  placeholder="1"
                />
              </div>
            </>
          ) : (
            <>
              <div className="px-6 py-4">
                <h3 className="text-lg font-display font-bold text-fox-ink mb-4">Cálculo por porcentaje</h3>
                <div className="space-y-4">
                  <div>
                    <label className="fox-label">Porcentaje base mensual (%)</label>
                    <input
                      className="fox-input w-24"
                      value={percent}
                      onChange={e => setPercent(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="fox-label">Desplazar mes</label>
                    <input
                      className="fox-input w-24"
                      value={shift}
                      onChange={e => setShift(e.target.value)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      0 = mes actual, +2 = dos meses adelante, -1 = mes anterior
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate("/editor")}
            className="btn btn-ghost"
          >
            Volver
          </button>
          <button
            onClick={handleGenerate}
            className="btn btn-primary"
            disabled={
              loading ||
              !hasRows ||
              (mode === "tabla" && !selectedTable)
            }
          >
            {loading ? "Generando..." : "Generar PDF"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 p-4 rounded-none border ${
              message.startsWith("Error")
                ? "border-fox-red bg-red-50 text-fox-red"
                : "border-fox-green bg-green-50 text-fox-green"
            }`}
          >
            {message.startsWith("Error") ? (
              <svg className="w-5 h-5 text-fox-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-fox-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {message}
          </div>
        )}
      </div>
    </Layout>
  )
}
