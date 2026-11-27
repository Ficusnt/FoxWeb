import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Percent, Play, Download, CheckCircle, Upload } from "lucide-react"
import Layout from "../components/Layout"
import { apiFetch } from "../lib/api"

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
    apiFetch("/api/tables")
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

      const resp = await apiFetch("/api/pdf/generate", {
        method: "POST",
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

  const stepLabel = step === 1 ? "Seleccionar modo" : step === 2 ? "Ingresar datos" : step === 3 ? "Configurar cálculo" : step === 4 ? "Nombrar y generar" : ""

  const stepLabels = ["Modo", "Datos", "Cálculo", "Nombre"]

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display mb-1">FOX</h1>
          <p className="text-sm text-gray-500">Actualizador de valores de expensas — coeficientes de agendae.com.ar</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator mb-8">
          {[1, 2, 3, 4].map((n) => {
            const active = step >= n
            const completed = step > n
            return (
              <div key={n} className="step">
                <div
                  className={`step-circle ${completed ? "completed" : active ? "active" : ""}`}
                >
                  {n}
                </div>
                {n < 4 && <div className={`step-line ${completed ? "completed" : ""}`} />}
                <span className="step-label">{stepLabels[n - 1]}</span>
              </div>
            )
          })}
        </div>

        {/* Step 1: Mode Selector */}
        {step === 1 && (
          <div className="fox-card">
            <h2 className="fox-card-title">Seleccionar modo de cálculo</h2>
            <p className="fox-card-desc">Elija cómo desea calcular los valores:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => { setMode("tabla"); setStep(2) }}
                className={`btn btn-primary w-full py-4 flex flex-col items-center gap-2 ${mode === "tabla" ? "bg-fox-blue text-white border-fox-blue" : ""}`}
              >
                <FileText size={28} className="mb-2" />
                <span className="font-medium">TABLA</span>
                <span className="text-xs text-gray-500">Usar coeficiente de tabla</span>
              </button>
              <button
                onClick={() => { setMode("porcentaje"); setStep(2) }}
                className={`btn btn-primary w-full py-4 flex flex-col items-center gap-2 ${mode === "porcentaje" ? "bg-fox-blue text-white border-fox-blue" : ""}`}
              >
                <Percent size={28} className="mb-2" />
                <span className="font-medium">PORCENTAJE</span>
                <span className="text-xs text-gray-500">Cálculo por % mensual</span>
              </button>
              <button
                onClick={() => navigate("/scraper")}
                className="btn btn-ghost w-full py-4 flex flex-col items-center gap-2 text-sm"
              >
                <Play size={24} className="mb-2" />
                <span className="font-medium">Scraper</span>
                <span className="text-xs text-gray-500">Configurar tablas de agendae</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Data Input */}
        {step === 2 && (
          <>
            <div className="fox-card mb-6">
              <h2 className="fox-card-title">Ingresar datos a calcular</h2>
              <p className="fox-card-desc">Fecha: MM/AA  Capital: número (ej. 15000 o 1.500,50)</p>
              <div className="overflow-x-auto">
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th className="w-12">#</th>
                      <th>Fecha</th>
                      <th>Capital</th>
                      <th className="text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-b border-fox-rule">
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                        <td className="px-4 py-3">
                          <input
                            className="fox-input text-right font-mono"
                            value={row.fecha}
                            onChange={(e) => updateField(i, "fecha", e.target.value)}
                            placeholder="MM/AA"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            className="fox-input text-right font-mono"
                            value={row.capital}
                            onChange={(e) => updateField(i, "capital", e.target.value)}
                            placeholder="1.500,50"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => removeRow(i)}
                              className="p-1.5 rounded-none hover:bg-red-50 text-red-600"
                              disabled={rows.length === 1}
                            >
                              {rows.length === 1 ? "~" : "−"}
                            </button>
                            <button
                              onClick={addRow}
                              className="ml-2 p-1.5 rounded-none hover:bg-gray-50 text-fox-blue"
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
              <div className="px-6 py-4 border-t border-fox-rule flex items-center justify-between">
                <div className="text-right">
                  <div className="text-sm font-semibold text-fox-ink">{formatMoney(total)}</div>
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
                    <button className="btn btn-sm btn-outline border-fox-rule px-3 py-2">
                      <Upload size={16} className="mr-1" />
                      Cargar desde PDF
                    </button>
                  </label>
                  {pdfLoadedName && (
                    <span className="text-xs text-fox-green bg-green-50 px-2 py-1 rounded-none">
                      {pdfLoadedName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => navigate("/")}
                className="btn btn-ghost"
              >
                Volver al inicio
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn btn-primary"
                disabled={rows.length === 0 || !rows.some((r) => r.fecha && r.capital)}
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {/* Step 3: Config */}
        {step === 3 && (
          <div className="fox-card mb-6">
            <h2 className="fox-card-title">
              {mode === "tabla" ? "Seleccionar tabla (CSV)" : "Configurar porcentaje"}
            </h2>
            <p className="fox-card-desc">
              {mode === "tabla" ? "Elija el coeficiente de tabla a aplicar" : "Porcentaje base mensual y desplazamiento"}
            </p>
            <div className="p-6">
              {mode === "tabla" ? (
                <>
                  {tables.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      No se encontraron tablas. Ejecute el scraper primero.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto border border-fox-rule bg-gray-50 p-3">
                      {tables.map((t) => (
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
                  <div className="mt-6 pt-6 border-t border-fox-rule">
                    <label className="fox-label">Multiplicador global</label>
                    <input
                      className="fox-input w-24"
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
                      <label className="fox-label">Porcentaje base mensual (%)</label>
                      <input
                        className="fox-input w-24"
                        value={percent}
                        onChange={(e) => setPercent(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="fox-label">Desplazar mes</label>
                      <input
                        className="fox-input w-24"
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
            <div className="px-6 py-4 border-t border-fox-rule flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="btn btn-ghost"
              >
                ← Volver
              </button>
              <button
                onClick={handleGenerate}
                className="btn btn-primary"
                disabled={loading || (mode === "tabla" && !selectedTable)}
              >
                {loading ? "Generando..." : "Generar PDF"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Name & Generate */}
        {step === 4 && (
          <div className="fox-card mb-6">
            <h2 className="fox-card-title">Nombrar y generar reporte</h2>
            <p className="fox-card-desc">Complete los campos para nombrar el archivo PDF</p>
            <div className="p-6 space-y-4">
              <div>
                <label className="fox-label">Administración</label>
                <input
                  className="fox-input"
                  value={admin}
                  onChange={(e) => setAdmin(e.target.value)}
                  placeholder="Ej. Sanchez Estudio"
                />
              </div>
              <div>
                <label className="fox-label">Calle y altura</label>
                <input
                  className="fox-input"
                  value={calleAltura}
                  onChange={(e) => setCalleAltura(e.target.value)}
                  placeholder="Ej. San Martín 453"
                />
              </div>
              <div>
                <label className="fox-label">Unidad</label>
                <input
                  className="fox-input"
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  placeholder="Ej. U 04-01"
                />
              </div>
              <div className="bg-gray-50 rounded-none p-3 border border-fox-rule text-xs text-gray-600">
                Nombre del archivo:{" "}
                <span className="font-mono text-fox-ink font-medium">
                  {suggestedName || "admin_calle_unidad"}.pdf
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-3">
              <button
                onClick={() => setStep(3)}
                className="btn btn-ghost"
              >
                ← Volver
              </button>
              <button
                onClick={handleGenerate}
                className="btn btn-primary"
                disabled={loading || !admin || !calleAltura || !unidad}
              >
                {loading ? "Generando PDF..." : "Generar PDF"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4b: PDF Preview & Download */}
        {pdfUrl && (
          <div className="fox-card mt-6">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-none flex items-center justify-center mx-auto mb-4 border border-fox-green">
                <CheckCircle size={32} className="text-fox-green" />
              </div>
              <h2 className="text-2xl font-display font-bold text-fox-ink mb-3">PDF generado correctamente</h2>
              <p className="text-sm text-gray-600 mb-6">
                Su reporte está listo para descargar.
              </p>
              <button
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = pdfUrl
                  link.download = `${suggestedName || "reporte"}.pdf`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="btn btn-primary w-full flex items-center justify-center gap-2 mb-6"
              >
                <Download size={18} />
                Descargar PDF
              </button>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-ghost btn-sm"
                >
                  Nuevo reporte
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="btn btn-ghost btn-sm"
                >
                  Inicio
                </button>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`fox-message ${
              message.startsWith("Error") ? "fox-message-error" : "fox-message-success"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </Layout>
  )
}
