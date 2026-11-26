import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Percent, ArrowLeft, Play } from "lucide-react"

const BG = "#f5f5f5"
const ACCENT = "#1565c0"
const ACCENT_DARK = "#0d47a1"
const BTN_DANGER = "#c62828"
const BTN_NEUTRAL = "#546e7a"
const FG_LIGHT = "#ffffff"
const FG_DARK = "#212121"

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

  // Load tables from API
  useEffect(() => {
    fetch("/api/tables")
      .then(r => r.json())
      .then((data: any) => setTables(data.tables ?? []))
      .catch(() => {})
  }, [])

  // Load saved input rows from localStorage
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
          setMessage("El multiplicador debe ser un numero.")
          return
        }
        payload.mode = "tabla"
        payload.globalMult = mult
        payload.tablePath = selectedTable
      } else {
        const pct = parseFloat(percent.replace(",", "."))
        if (isNaN(pct)) {
          setMessage("Ingrese un porcentaje valido.")
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

      const resp = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="min-h-screen" style={{ background: BG }}>
      <div className="flex px-4 py-4">
        <div className="px-4 py-1.5 font-bold text-gray-500" style={{ background: BTN_NEUTRAL, color: FG_LIGHT }}>
          Datos
        </div>
        <div className="mx-2 mt-1">➔</div>
        <div
          className={`px-4 py-1.5 rounded font-bold text-white`}
          style={{ background: ACCENT }}
        >
          Opciones
        </div>
        <div className="mx-2 mt-1">➔</div>
        <div className="px-4 py-1.5 font-bold text-gray-500" style={{ background: BTN_NEUTRAL, color: FG_LIGHT }}>
          PDF
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode("tabla")}
            className={`px-4 py-2 rounded font-medium text-sm transition ${mode === "tabla" ? "bg-accent text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Tablas (CSV)
          </button>
          <button
            onClick={() => setMode("porcentaje")}
            className={`px-4 py-2 rounded font-medium text-sm transition ${mode === "porcentaje" ? "bg-accent text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Porcentaje
          </button>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-200">
          {mode === "tabla" ? (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Seleccionar tabla (CSV)</h2>
              {tables.length === 0 ? (
                <p className="text-gray-500">
                  No se encontraron archivos CSV. Ejecute el scraper primero.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                  {tables.map(t => (
                    <button
                      key={t.path}
                      onClick={() => setSelectedTable(t.path)}
                      className={`w-full text-left px-3 py-2 rounded border text-left transition text-sm ${selectedTable === t.path ? "bg-blue-50 border-blue-300 text-blue-700 font-medium" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                    >
                      {t.path}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Multiplicador global:
                </label>
                <input
                  className="w-24 text-sm px-1 py-1 border rounded focus:ring-2 focus:ring-accent outline-none"
                  value={multiplier}
                  onChange={e => setMultiplier(e.target.value)}
                  placeholder="1"
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Calculo por porcentaje</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Porcentaje base mensual (%):
                  </label>
                  <input
                    className="w-24 text-sm px-1 py-1 border rounded focus:ring-2 focus:ring-accent outline-none"
                    value={percent}
                    onChange={e => setPercent(e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Desplazar mes:
                  </label>
                  <input
                    className="w-24 text-sm px-1 py-1 border rounded focus:ring-2 focus:ring-accent outline-none"
                    value={shift}
                    onChange={e => setShift(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    0 = mes actual, +2 = dos meses adelante, -1 = mes anterior
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate("/editor")}
            className="px-4 py-1.5 text-sm font-medium rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Volver
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-1.5 text-sm font-medium rounded bg-accent text-white hover:bg-accent-dark"
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
            className={`mt-4 p-3 rounded text-sm border ${
              message.startsWith("Error")
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
