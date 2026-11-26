import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Save, Play, ArrowLeft, Plus, Minus, List } from "lucide-react"

const BG = "#f5f5f5"
const ACCENT = "#1565c0"
const ACCENT_DARK = "#0d47a1"
const BTN_DANGER = "#c62828"
const BTN_NEUTRAL = "#546e7a"
const FG_LIGHT = "#ffffff"
const FG_DARK = "#212121"
const ROW_ALT = "#e8eaf6"
const BORDER = "#bdbdbd"
const ERROR_BG = "#ffebee"

type TableEntry = {
  id: string
  name: string
  url: string
}

export default function ScraperConfig() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<TableEntry[]>([])
  const [retencion, setRetencion] = useState("6")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Load config from API
  useEffect(() => {
    fetch("/api/scraper/config")
      .then(r => r.json())
      .then((data: any) => {
        setRetencion(String(data.retencion ?? 6))
        const ents: TableEntry[] = (data.tables ?? []).map((t: any, i: number) => ({
          id: String(i),
          name: t.name,
          url: t.url
        }))
        // Always ensure an empty row at the bottom
        if (ents.length === 0 || ents[ents.length - 1].name !== "") {
          ents.push({ id: crypto.randomUUID(), name: "", url: "" })
        }
        setEntries(ents)
      })
      .catch(() => {
        // Start with one empty row
        setEntries([{ id: crypto.randomUUID(), name: "", url: "" }])
      })
  }, [])

  const persist = () => {
    const valid = entries.filter(e => e.name.trim() && e.url.trim())
    fetch("/api/scraper/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        retencion: parseInt(retencion, 10) || 6,
        tables: valid.map(e => ({ name: e.name.trim(), url: e.url.trim() }))
      })
    }).catch(() => {})
  }

  const addRow = (insertAfter?: number) => {
    const newRow: TableEntry = { id: crypto.randomUUID(), name: "", url: "" }
    setEntries(prev => {
      const next = [...prev]
      // Don't add if last row already empty
      if (next.length > 0 && !next[next.length - 1].name && !next[next.length - 1].url) {
        return next
      }
      const idx = insertAfter === undefined ? next.length : insertAfter + 1
      next.splice(idx, 0, newRow)
      return next
    })
    persist()
  }

  const removeRow = (index: number) => {
    setEntries(prev => {
      if (prev.length === 1) {
        return [{ ...prev[0], name: "", url: "" }]
      }
      const next = prev.filter((_, i) => i !== index)
      // Always keep an empty row at bottom
      if (next.length === 0 || (next[next.length - 1].name || next[next.length - 1].url)) {
        next.push({ id: crypto.randomUUID(), name: "", url: "" })
      }
      return next
    })
    persist()
  }

  const updateField = (index: number, field: "name" | "url", value: string) => {
    setEntries(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
    // Debounced persist
    clearTimeout((window as any)._persistTimer)
    ;(window as any)._persistTimer = setTimeout(() => persist(), 300)
  }

  const handleSave = () => {
    persist()
    setMessage("Configuracion guardada")
    setTimeout(() => setMessage(""), 2000)
  }

  const handleRunScraper = async () => {
    setLoading(true)
    setMessage("Ejecutando scraper...")
    try {
      const resp = await fetch("/api/scraper/run", { method: "POST" })
      const data = await resp.json()
      if (data.ok) {
        setMessage("Tablas actualizadas correctamente")
      } else {
        setMessage(`Error: ${data.message}`)
        data.results?.forEach((r: any) => console.log(r.name, r.status))
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  const hasValidEntries = entries.some(e => e.name.trim() && e.url.trim())

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Workflow ribbon */}
      <div className="flex px-4 py-4">
        <div className="px-4 py-1.5 font-bold text-gray-500" style={{ background: BTN_NEUTRAL, color: FG_LIGHT }}>
          Datos
        </div>
        <div className="mx-2 mt-1">➔</div>
        <div className="px-4 py-1.5 font-bold text-gray-500" style={{ background: BTN_NEUTRAL, color: FG_LIGHT }}>
          Opciones
        </div>
        <div className="mx-2 mt-1">➔</div>
        <div
          className={`px-4 py-1.5 rounded font-bold text-white`}
          style={{ background: ACCENT }}
        >
          Scraper
        </div>
      </div>

      <h1 className="text-xl font-bold text-gray-800 px-4 pt-4">Configuracion del scraper</h1>
      <p className="text-sm text-gray-500 px-4">Editar TABLAS/config.txt</p>

      {/* Tables list */}
      <div className="px-4">
        <h2 className="text-sm font-bold text-gray-700 mb-2">Tablas configuradas</h2>
        <div className="flex" style={{ background: ACCENT }}>
          <div className="flex-1 px-2 py-2 text-xs font-bold text-white" style={{ color: FG_LIGHT }}>Nombre</div>
          <div className="w-80 px-2 py-2 text-xs font-bold text-white" style={{ color: FG_LIGHT }}>URL</div>
          <div className="w-16 px-2 py-2 text-xs font-bold text-white" style={{ color: FG_LIGHT }}></div>
        </div>

        <div className="max-h-[40vh] overflow-y-auto border border-gray-300" style={{ background: "#ffffff" }}>
          {entries.map((entry, i) => {
            const isErr = !entry.name || !entry.url || !entry.url.toLowerCase().startsWith("http")
            return (
              <div
                key={entry.id}
                className="flex items-center gap-2 px-2 py-1 border-b border-gray-200"
                style={{
                  background: i % 2 === 1 ? ROW_ALT : "#ffffff"
                }}
              >
                <input
                  className="flex-1 text-sm px-1 py-1 border rounded focus:ring-2 focus:ring-accent outline-none"
                  style={{
                    background: isErr ? ERROR_BG : "transparent",
                    color: FG_DARK
                  }}
                  value={entry.name}
                  onChange={e => updateField(i, "name", e.target.value)}
                  placeholder="BCRA_ACT_SUM"
                />
                <input
                  className="w-80 text-sm px-1 py-1 border rounded focus:ring-2 focus:ring-accent outline-none"
                  style={{
                    background: isErr ? ERROR_BG : "transparent",
                    color: FG_DARK
                  }}
                  value={entry.url}
                  onChange={e => updateField(i, "url", e.target.value)}
                  placeholder="https://www.agendae.com.ar/listado1.aspx?t=42"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => removeRow(i)}
                    className="px-1.5 py-1 text-xs font-bold rounded bg-red-500 text-white hover:bg-red-600"
                    title="Eliminar"
                  >
                    −
                  </button>
                  <button
                    onClick={() => addRow(i)}
                    className="px-1.5 py-1 text-xs font-bold rounded bg-blue-600 text-white hover:bg-blue-700"
                    title="Insertar debajo"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm font-medium rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Guardar en config.txt
          </button>
          {message && <span className="ml-2 text-sm text-green-700">{message}</span>}
        </div>
      </div>

      {/* Retention (at bottom) */}
      <div className="px-4 mt-4 pb-4 border-t border-gray-300" style={{ background: "#ffffff" }}>
        <h2 className="text-sm font-bold text-gray-700 mb-2">Retencion de snapshots (meses)</h2>
        <input
          className="w-24 text-sm px-1 py-1 border rounded focus:ring-2 focus:ring-accent outline-none"
          value={retencion}
          onChange={e => setRetencion(e.target.value)}
          onBlur={persist}
        />
        <p className="text-xs text-gray-500 mt-1">
          Cuantos snapshots (meses previos) conservar por tabla. El archivo actual suma aparte.
        </p>
      </div>

      {/* Bottom bar */}
      <div className="px-4 pb-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-1.5 text-sm font-medium rounded bg-gray-500 text-white hover:bg-gray-600"
        >
          Volver
        </button>
        <button
          onClick={handleRunScraper}
          className="px-4 py-1.5 text-sm font-medium rounded bg-accent text-white hover:bg-accent-dark"
          disabled={loading || !hasValidEntries}
        >
          {loading ? "Ejecutando..." : "Ejecutar scraper ahora"}
        </button>
      </div>
    </div>
  )
}
