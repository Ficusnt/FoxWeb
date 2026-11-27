import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Percent, ArrowLeft, Play, Download, CheckCircle, Upload } from "lucide-react"
import Layout from "../components/Layout"
import Button from "../components/Button"
import Card from "../components/Card"
import CardHeader from "../components/Card"
import CardFooter from "../components/Card"

type TableFile = { folder: string; name: string; path: string }
type InputRow = { fecha: string; capital: string }

type WizardMode = "tabla" | "porcentaje"

export default function Wizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<WizardMode | null>(null)

  // Step 2 - manual input
  const [rows, setRows] = useState<InputRow[]>([{ fecha: "", capital: "" }])
  const [pdfLoadedName, setPdfLoadedName] = useState<string | null>(null)

  // Step 3 - tabla mode
  const [tables, setTables] = useState<TableFile[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [multiplier, setMultiplier] = useState("1")

  // Step 3 - porcentaje mode
  const [percent, setPercent] = useState("5")
  const [shift, setShift] = useState("0")

  // Step 4 - naming
  const [admin, setAdmin] = useState("")
  const [calleAltura, setCalleAltura] = useState("")
  const [unidad, setUnidad] = useState("")

  // UI state
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Load tables when entering step 3 with tabla mode
  if (step === 3 && mode === "tabla" && tables.length === 0) {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((data: any) => setTables(data.tables ?? []))
      .catch(() => {})
  }

  const total = rows.reduce((sum, r) => {
    try { return sum + parseFloat(r.capital.replace(/[^0-9.,-]/g, "").replace(".", "").replace(",", ".") || "0") } catch { return sum }
  }, 0)

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(val)
  }

  const addRow = () => {
    setRows([...rows, { fecha: "", capital: "" }])
  }

  const removeRow = (idx: number) => {
    if (rows.length === 1) {
      setRows([{ fecha: "", capital: "" }])
      return
    }
    setRows(rows.filter((_, i) => i !== idx))
  }

  const updateField = (idx: number, field: "fecha" | "capital", value: string) => {
    const next = [...rows]
    next[idx] = { ...next[idx], [field]: value }
    setRows(next)
  }

  const handleGenerate = async () => {
    if (mode === "tabla" && !selectedTable) {
      setMessage("Seleccione una tabla CSV.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const payload: any = {
        inputRows: rows.map((r) => ({ date: r.fecha, capital: parseFloat(r.capital.replace(",", ".")) || 0 })).filter((r) => r.date && r.capital),
        mode,
        admin,
        edif: calleAltura,
        unid: unidad,
        outputName: "",
      }

      if (mode === "tabla") {
        const mult = parseFloat(multiplier.replace(",", ".")) || 1
        payload.mode = "tabla"
        payload.globalMult = mult
        payload.tablePath = selectedTable!
      } else {
        const pct = parseFloat(percent.replace(",", ".")) || 5
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
        body: JSON.stringify(payload),
      })

      if (resp.ok) {
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
        setStep(4)
      } else {
        const result = await resp.json()
        setMessage(`Error: ${result.error}`)
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  const suggestedName = `${admin.trim()}${calleAltura.trim() ? "_" : ""}${calleAltura.trim()}${unidad.trim() ? "_" : ""}${unidad.trim()}`.replace(/_+/g, "_").replace(/_$/, "")

  const stepLabel = step === 1 ? "Seleccionar modo" : step === 2 ? "Ingresar datos" : step === 3 ? "Configurar cálculo" : step === 4 ? "Generar PDF" : ""

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">FOX — Generador de Reportes</h1>
          <p className="text-sm text-gray-500">Paso {step} de 4: {stepLabel}</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((n) => {
            const active = step >= n
            const completed = step > n
            return (
              <div key={n} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    completed ? "bg-green-500 text-white" : active ? "bg-accent text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {n}
                </div>
                {n < 4 && <div className={`w-4 h-0.5 ${completed || step > n ? "bg-green-500" : active ? "bg-accent" : "bg-gray-300"}`} />}
              </div>
            )
          })}
        </div>

        {/* Step 1: Mode Selector */}
        {step === 1 && (
          <Card className="mb-6">
            <CardHeader
              title="Seleccionar modo de cálculo"
              description="Elija cómo desea calcular los valores:"
            />
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => { setMode("tabla"); setStep(2) }}
                variant={mode === "tabla" ? "default" : "outline"}
                className="w-full py-4 flex flex-col items-center gap-2"
              >
                <FileText size={28} className="mb-2" />
                <span className="font-medium text-gray-900">TABLA</span>
                <span className="text-xs text-gray-500">Usar coeficiente de tabla</span>
              </Button>
              <Button
                onClick={() => { setMode("porcentaje"); setStep(2) }}
                variant={mode === "porcentaje" ? "default" : "outline"}
                className="w-full py-4 flex flex-col items-center gap-2"
              >
                <Percent size={28} className="mb-2" />
                <span className="font-medium text-gray-900">PORCENTAJE</span>
                <span className="text-xs text-gray-500">Cálculo por % mensual</span>
              </Button>
              <Button
                onClick={() => navigate("/scraper")}
                variant="outline"
                className="w-full py-4 flex flex-col items-center gap-2 text-sm"
              >
                <Play size={24} className="mb-2" />
                <span className="font-medium text-gray-900">Scraper</span>
                <span className="text-xs text-gray-500">Configurar tablas de agendae</span>
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Data Input */}
        {step === 2 && (
          <>
            <Card className="mb-6">
              <CardHeader
                title="Ingresar datos a calcular"
                description="Fecha: MM/AA  Capital: número (ej. 15000 o 1.500,50)"
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-12">#</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">Capital</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                        <td className="px-4 py-3">
                          <input
                            className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none text-right font-mono"
                            value={row.fecha}
                            onChange={(e) => updateField(i, "fecha", e.target.value)}
                            placeholder="MM/AA"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none text-right font-mono"
                            value={row.capital}
                            onChange={(e) => updateField(i, "capital", e.target.value)}
                            placeholder="1.500,50"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => removeRow(i)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-500"
                              disabled={rows.length === 1}
                            >
                              {rows.length === 1 ? "~" : "−"}
                            </button>
                            <button
                              onClick={addRow}
                              className="ml-2 p-1.5 rounded hover:bg-accent/50 text-accent"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{formatMoney(total)}</div>
                  <div className="text-xs text-gray-500">Total capital</div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-700 flex items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setPdfLoadedName(file.name.replace(/\.pdf$/i, ""))
                      }}
                      className="sr-only"
                    />
                    <Button variant="outline" size="sm" className="px-3 py-2">
                      <Upload size={16} className="mr-1" />
                      Cargar desde PDF
                    </Button>
                  </label>
                  {pdfLoadedName && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      {pdfLoadedName}
                    </span>
                  )}
                </div>
              </div>
            </Card>
            <div className="flex justify-end gap-3">
              <Button onClick={() => navigate("/")} variant="outline">
                Volver al inicio
              </Button>
              <Button onClick={() => setStep(3)} variant="default" disabled={rows.length === 0 || !rows.some((r) => r.fecha && r.capital)}>
                Continuar →
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Config */}
        {step === 3 && (
          <Card className="mb-6">
            <CardHeader
              title={mode === "tabla" ? "Seleccionar tabla (CSV)" : "Configurar porcentaje"}
              description={mode === "tabla" ? "Elija el coeficiente de tabla a aplicar" : "Porcentaje base mensual y desplazamiento"}
            />
            <div className="p-6">
              {mode === "tabla" ? (
                <>
                  {tables.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      No se encontraron tablas. Ejecute el scraper primero.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded bg-gray-50 p-3">
                      {tables.map((t) => (
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
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Multiplicador global:
                    </label>
                    <input
                      className="w-24 px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
                      value={multiplier}
                      onChange={(e) => setMultiplier(e.target.value)}
                      placeholder="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se aplica como: (coeficiente − 1) × mult + 1
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Porcentaje base mensual (%):
                      </label>
                      <input
                        className="w-24 px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
                        value={percent}
                        onChange={(e) => setPercent(e.target.value)}
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
                        onChange={(e) => setShift(e.target.value)}
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        0 = mes actual, +2 = dos meses adelante, −1 = mes anterior
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
              <Button onClick={() => setStep(2)} variant="outline">
                ← Volver
              </Button>
              <Button onClick={handleGenerate} variant="default" disabled={loading || (mode === "tabla" && !selectedTable)}>
                {loading ? "Generando..." : "Generar PDF →"}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Name & Generate */}
        {step === 4 && (
          <Card className="mb-6">
            <CardHeader
              title="Nombrar y generar reporte"
              description="Complete los campos para nombrar el archivo PDF"
            />
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Administración:
                </label>
                <input
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
                  value={admin}
                  onChange={(e) => setAdmin(e.target.value)}
                  placeholder="Ej. Sanchez Estudio"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Calle y Altura:
                </label>
                <input
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
                  value={calleAltura}
                  onChange={(e) => setCalleAltura(e.target.value)}
                  placeholder="Ej. San Martin 453"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Unidad:
                </label>
                <input
                  className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  placeholder="Ej. U 04-01"
                />
              </div>
              <div className="bg-gray-50 rounded p-3 text-xs text-gray-600">
                Nombre del archivo:{" "}
                <span className="font-mono text-gray-900 font-medium">
                  {suggestedName || "admin_calle_unidad"}.pdf
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-3">
              <Button onClick={() => setStep(3)} variant="outline">
                ← Volver
              </Button>
              <Button onClick={handleGenerate} variant="default" disabled={loading || !admin || !calleAltura || !unidad}>
                {loading ? "Generando PDF..." : "Generar PDF"}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4b: PDF Preview & Download */}
        {pdfUrl && (
          <Card className="mt-6">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">PDF generado correctamente</h3>
              <p className="text-sm text-gray-600 mb-6">
                Su reporte está listo para descargar.
              </p>
              <Button
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = pdfUrl
                  link.download = `${suggestedName || "reporte"}.pdf`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                variant="default"
                className="w-full flex items-center justify-center gap-2 mb-6"
              >
                <Download size={18} />
                Descargar PDF
              </Button>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setStep(1)} variant="outline" size="sm">
                  Nuevo reporte
                </Button>
                <Button onClick={() => navigate("/")} variant="ghost" size="sm">
                  Inicio
                </Button>
              </div>
            </div>
          </Card>
        )}

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
