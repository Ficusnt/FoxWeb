import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Layout from "../components/Layout"
import { apiFetch } from "../lib/api"

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear pending debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    apiFetch("/api/scraper/config")
      .then(r => r.json())
      .then((data: any) => {
        setRetencion(String(data.retencion ?? 6))
        const ents: TableEntry[] = (data.tables ?? []).map((t: any, i: number) => ({
          id: String(i),
          name: t.name,
          url: t.url
        }))
        if (ents.length === 0 || ents[ents.length - 1].name !== "") {
          ents.push({ id: crypto.randomUUID(), name: "", url: "" })
        }
        setEntries(ents)
      })
      .catch(() => {
        setEntries([{ id: crypto.randomUUID(), name: "", url: "" }])
      })
  }, [])

  const persist = () => {
    const valid = entries.filter(e => e.name.trim() && e.url.trim())
    apiFetch("/api/scraper/config", {
      method: "POST",
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
    clearTimeout(timerRef.current ?? undefined)
    timerRef.current = setTimeout(() => persist(), 300)
  }

  const handleRunScraper = async () => {
    setLoading(true)
    setMessage("Ejecutando scraper...")
    try {
      const resp = await apiFetch("/api/scraper/run", { method: "POST" })
      const data = await resp.json()
      if (data.ok) {
        setMessage("Tablas actualizadas correctamente")
      } else {
        setMessage(`Error: ${data.message}`)
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  const hasValidEntries = entries.some(e => e.name.trim() && e.url.trim())

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-fox-ink mb-1">Configuración del scraper</h1>
            <p className="text-sm text-gray-500">Editar TABLAS/config.txt</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>

        <div className="fox-card mb-6">
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th className="w-3/4">URL</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isErr =
                    !entry.name || !entry.url || !entry.url.toLowerCase().startsWith("http")
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-fox-rule ${isErr ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          className={`fox-input ${
                            isErr ? "border-fox-red ring-2 ring-fox-red/20" : "border-fox-rule"
                          }`}
                          value={entry.name}
                          onChange={e => updateField(i, "name", e.target.value)}
                          placeholder="BCRA_ACT_SUM"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className={`fox-input ${
                            isErr ? "border-fox-red ring-2 ring-fox-red/20" : "border-fox-rule"
                          }`}
                          value={entry.url}
                          onChange={e => updateField(i, "url", e.target.value)}
                          placeholder="https://www.agendae.com.ar/listado1.aspx?t=42"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => removeRow(i)}
                            className="p-2 rounded-none hover:bg-gray-100 text-gray-500 hover:text-fox-red"
                            title="Eliminar"
                          >
                            −
                          </button>
                          <button
                            onClick={() => addRow(i)}
                            className="p-2 rounded-none hover:bg-gray-100 text-fox-blue"
                            title="Insertar debajo"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <button
              onClick={() => persist()}
              className="btn btn-outline btn-sm"
            >
              Guardar configuración
            </button>
            {message && (
              <span className="text-sm text-fox-green">{message}</span>
            )}
          </div>
        </div>

        <div className="fox-card mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-display font-bold text-fox-ink">Retención de snapshots (meses)</h3>
            </div>
            <div className="flex items-center gap-4">
              <input
                className="fox-input w-24"
                value={retencion}
                onChange={e => setRetencion(e.target.value)}
                onBlur={persist}
              />
              <p className="text-xs text-gray-500">
                Cuántos snapshots (meses previos) conservar por tabla. El archivo actual suma aparte.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleRunScraper}
            className="btn btn-primary"
            disabled={loading || !hasValidEntries}
          >
            {loading ? "Ejecutando..." : "Ejecutar scraper ahora"}
          </button>
        </div>
      </div>
    </Layout>
  )
}
