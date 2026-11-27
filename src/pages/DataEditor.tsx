import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Minus, LayoutList } from "lucide-react"
import Layout from "../components/Layout"
import {
  saveInputRowsToLocal,
  loadInputRowsFromLocal,
} from "../lib/storage"
import { normalizeDate, normalizeNumber, formatMoney } from "../lib/normalization"

type Row = {
  id: string
  fecha: string
  capital: string
}

export default function DataEditor() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>(() => {
    const saved = loadInputRowsFromLocal()
    if (saved.length > 0) {
      return saved.map((r, i) => ({ id: String(i), fecha: r.date, capital: formatMoney(r.capital) }))
    }
    return [{ id: "0", fecha: "", capital: "" }]
  })
  const [errors, setErrors] = useState<Set<number>>(new Set())

  const total = rows.reduce((sum, r) => {
    try { return sum + normalizeNumber(r.capital) } catch { return sum }
  }, 0)

  const addRow = (insertAfter?: number) => {
    const idx = insertAfter === undefined ? rows.length : insertAfter + 1
    const newRow: Row = { id: crypto.randomUUID(), fecha: "", capital: "" }
    setRows(prev => {
      const next = [...prev]
      next.splice(idx, 0, newRow)
      return next
    })
  }

  const removeRow = (index: number) => {
    if (rows.length === 1) {
      setRows([{ ...rows[0], fecha: "", capital: "" }])
      return
    }
    setRows(prev => prev.filter((_, i) => i !== index))
  }

  const updateField = (index: number, field: "fecha" | "capital", value: string) => {
    setRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
    setErrors(prev => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  const handleContinue = () => {
    const valid: { date: string; capital: number }[] = []
    const newErrors = new Set<number>()

    for (let i = 0; i < rows.length; i++) {
      const { fecha, capital } = rows[i]
      if (!fecha && !capital) continue

      let ok = true
      try { normalizeDate(fecha) } catch { ok = false }
      try { normalizeNumber(capital) } catch { ok = false }

      if (!ok) {
        newErrors.add(i)
      } else {
        valid.push({ date: normalizeDate(fecha), capital: normalizeNumber(capital) })
      }
    }

    setErrors(newErrors)

    if (newErrors.size > 0) {
      alert("Hay celdas con valores inválidos. Fecha: MM/AA. Capital: número.")
      return
    }
    if (valid.length === 0) {
      alert("Ingrese al menos una fila.")
      return
    }

    saveInputRowsToLocal(valid)
    navigate("/opciones")
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-fox-ink mb-1">Datos a calcular</h1>
            <p className="text-sm text-gray-500">
              Fecha: MM/AA  Capital: número (ej. 15000 o 1.500,50)
            </p>
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
                  <th className="w-12">#</th>
                  <th>Fecha</th>
                  <th>Capital</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isErr = errors.has(i)
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-fox-rule ${
                        i % 2 === 1 ? "bg-gray-50" : ""
                      } ${isErr ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-4 py-3">
                        <input
                          className={`fox-input text-right font-mono ${
                            isErr ? "border-fox-red ring-2 ring-fox-red/20" : "border-fox-rule"
                          }`}
                          value={row.fecha}
                          onChange={e => updateField(i, "fecha", e.target.value)}
                          placeholder="MM/AA"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className={`fox-input text-right font-mono ${
                            isErr ? "border-fox-red ring-2 ring-fox-red/20" : "border-fox-rule"
                          }`}
                          value={row.capital}
                          onChange={e => updateField(i, "capital", e.target.value)}
                          placeholder="1.500,50"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => removeRow(i)}
                            className="p-2 rounded-none hover:bg-gray-100 text-gray-500 hover:text-fox-red"
                            title="Eliminar"
                          >
                            {rows.length === 1 ? "~" : "−"}
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
        </div>

        <div className="flex items-end justify-between mb-6">
          <div className="text-right">
            <div className="text-3xl font-display font-bold text-fox-ink">{formatMoney(total)}</div>
            <div className="text-xs text-gray-500">Total capital</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setRows([{ id: "0", fecha: "", capital: "" }])
              setErrors(new Set())
            }}
            className="btn btn-destructive"
          >
            Limpiar tabla
          </button>
          <button
            onClick={() => {
              alert("Cargar desde PDF próximamente")
            }}
            className="btn btn-outline"
          >
            Cargar desde PDF
          </button>
          <button
            onClick={handleContinue}
            className="btn btn-primary"
          >
            Continuar
          </button>
        </div>
      </div>
    </Layout>
  )
}
