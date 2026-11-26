import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Percent, ArrowLeft } from "lucide-react"
import Layout from "../components/Layout"
import Button from "../components/Button"
import Card from "../components/Card"

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
    fetch("/api/tables")
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
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Generar reporte</h1>
            <p className="text-sm text-gray-500">Seleccione el modo de cálculo</p>
          </div>
          <Button onClick={() => navigate("/editor")} variant="outline" size="sm">
            <ArrowLeft size={16} /> Volver
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setMode("tabla")}
            variant={mode === "tabla" ? "default" : "outline"}
            className="flex-1"
          >
            <FileText size={18} className="mr-2" />
            Tablas (CSV)
          </Button>
          <Button
            onClick={() => setMode("porcentaje")}
            variant={mode === "porcentaje" ? "default" : "outline"}
            className="flex-1"
          >
            <Percent size={18} className="mr-2" />
            Porcentaje
          </Button>
        </div>

        <Card className="mb-6">
          {mode === "tabla" ? (
            <>
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar tabla (CSV)</h3>
                {tables.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    No se encontraron archivos CSV. Ejecute el scraper primero.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded bg-gray-50 p-2">
                    {tables.map(t => (
                      <button
                        key={t.path}
                        onClick={() => setSelectedTable(t.path)}
                        className={`w-full text-left px-3 py-2 rounded border text-left transition text-sm ${
                          selectedTable === t.path ? "bg-blue-50 border-blue-300 text-blue-700 font-medium" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {t.path}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Multiplicador global:
                </label>
                <input
                  className="w-24 px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
                  value={multiplier}
                  onChange={e => setMultiplier(e.target.value)}
                  placeholder="1"
                />
              </div>
            </>
          ) : (
            <>
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cálculo por porcentaje</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Porcentaje base mensual (%):
                    </label>
                    <input
                      className="w-24 px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
                      value={percent}
                      onChange={e => setPercent(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Desplazar mes:
                    </label>
                    <input
                      className="w-24 px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
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
        </Card>

        <div className="flex justify-end gap-3">
          <Button onClick={() => navigate("/editor")} variant="outline">
            Volver
          </Button>
          <Button
            onClick={handleGenerate}
            variant="default"
            disabled={
              loading ||
              !hasRows ||
              (mode === "tabla" && !selectedTable)
            }
          >
            {loading ? "Generando..." : "Generar PDF"}
          </Button>
        </div>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm flex items-center gap-3 ${
              message.startsWith("Error")
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            {message.startsWith("Error") ? (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
