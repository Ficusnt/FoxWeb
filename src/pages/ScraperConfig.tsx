import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import Button from "../components/Button"
import Card from "../components/Card"

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
    clearTimeout((window as any)._persistTimer)
    ;(window as any)._persistTimer = setTimeout(() => persist(), 300)
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
            <h1 className="text-2xl font-bold text-gray-900">Configuración del scraper</h1>
            <p className="text-sm text-gray-500">Editar TABLAS/config.txt</p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline" size="sm">
            <ArrowLeft size={16} /> Volver
          </Button>
        </div>

        <Card className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500">Nombre</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-3/4">URL</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isErr =
                    !entry.name || !entry.url || !entry.url.toLowerCase().startsWith("http")
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-100 transition-colors ${
                        i % 2 === 1 ? "bg-gray-50" : ""
                      } ${isErr ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          className={`w-full px-3 py-2 text-sm rounded border focus:ring-2 focus:ring-accent outline-none ${
                            isErr ? "border-red-500 ring-2 ring-red-500/20" : "border-gray-300"
                          }`}
                          value={entry.name}
                          onChange={e => updateField(i, "name", e.target.value)}
                          placeholder="BCRA_ACT_SUM"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className={`w-full px-3 py-2 text-sm rounded border focus:ring-2 focus:ring-accent outline-none ${
                            isErr ? "border-red-500 ring-2 ring-red-500/20" : "border-gray-300"
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
                            className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-red-500"
                            title="Eliminar"
                          >
                            −
                          </button>
                          <button
                            onClick={() => addRow(i)}
                            className="p-2 rounded hover:bg-accent/50 text-accent hover:bg-accent/100"
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
            <Button onClick={() => persist()} variant="outline" size="sm">
              Guardar en config.txt
            </Button>
            {message && (
              <span className="text-sm text-green-600">{message}</span>
            )}
          </div>
        </Card>

        <Card className="mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Retención de snapshots (meses)</h3>
            </div>
            <div className="flex items-center gap-4">
              <input
                className="w-24 px-3 py-2 text-sm rounded border border-gray-300 focus:ring-2 focus:ring-accent outline-none"
                value={retencion}
                onChange={e => setRetencion(e.target.value)}
                onBlur={persist}
              />
              <p className="text-xs text-gray-500">
                Cuántos snapshots (meses previos) conservar por tabla. El archivo actual suma aparte.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleRunScraper}
            variant="default"
            disabled={loading || !hasValidEntries}
          >
            {loading ? "Ejecutando..." : "Ejecutar scraper ahora"}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
