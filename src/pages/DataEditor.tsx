import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Save, Play, ArrowLeft, Plus, Minus, LayoutList } from "lucide-react"
import { saveInputRowsToLocal, loadInputRowsFromLocal } from "../lib/storage"
import { normalizeDate, normalizeNumber, formatMoney } from "../lib/normalization"

const BG = "#f5f5f5"
const BG_TABLE = "#ffffff"
const ACCENT = "#1565c0"
const ACCENT_DARK = "#0d47a1"
const BTN_DANGER = "#c62828"
const BTN_NEUTRAL = "#546e7a"
const FG_LIGHT = "#ffffff"
const FG_DARK = "#212121"
const ROW_ALT = "#e8eaf6"
const BORDER = "#bdbdbd"
const ERROR_BG = "#ffebee"

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
  const [saving, setSaving] = useState(false)

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

  const persist = () => {
    const valid: { date: string; capital: number }[] = []
    for (const r of rows) {
      if (r.fecha && r.capital) {
        try {
          valid.push({ date: normalizeDate(r.fecha), capital: normalizeNumber(r.capital) })
        } catch { /* skip invalid */ }
      }
    }
    saveInputRowsToLocal(valid)
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
      alert("Hay celdas con valores invalidos. Fecha: MM/AA. Capital: numero.")
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
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Workflow ribbon */}
      <div className="flex px-4 py-4">
        <div
          className={`px-4 py-1.5 rounded font-bold text-white`}
          style={{ background: ACCENT }}
        >
          Datos
        </div>
        <div className="mx-2 mt-1">➔</div>
        <div className="px-4 py-1.5 font-bold text-gray-500" style={{ background: BTN_NEUTRAL, color: FG_LIGHT }}>
          Opciones
        </div>
        <div className="mx-2 mt-1">➔</div>
        <div className="px-4 py-1.5 font-bold text-gray-500" style={{ background: BTN_NEUTRAL, color: FG_LIGHT }}>
          PDF
        </div>
      </div>

      <h1 className="text-xl font-bold text-gray-800 px-4 pt-4">Datos a calcular</h1>
      <p className="text-sm text-gray-500 px-4">
        Fecha: MM/AA  Capital: numero (ej. 15000 o 1.500,50)
      </p>

      {/* Table header */}
      <div className="flex px-4" style={{ background: ACCENT }}>
        <div className="w-4 px-2 py-2 text-xs font-bold text-white" style={{ color: FG_LIGHT }}>#</div>
        <div className="flex-1 px-2 py-2 text-xs font-bold text-white" style={{ color: FG_LIGHT }}>Fecha</div>
        <div className="w-48 px-2 py-2 text-xs font-bold text-white" style={{ color: FG_LIGHT }}>Capital</div>
        <div className="w-20 px-2 py-2 text-xs font-bold text-white" style={{ color: FG_LIGHT }}></div>
      </div>

      {/* Scrollable rows */}
      <div className="px-4 max-h-[60vh] overflow-y-auto border border-gray-300" style={{ background: BG_TABLE }}>
        {rows.map((row, i) => {
          const isErr = errors.has(i)
          const isLast = i === rows.length - 1
          return (
            <div
              key={row.id}
              className="flex items-center gap-2 px-2 py-1 border-b border-gray-200"
              style={{
                background: i % 2 === 1 ? ROW_ALT : BG_TABLE
              }}
            >
              <div className="w-4 text-center text-xs text-gray-500 font-mono">{i + 1}</div>
              <input
                className="flex-1 text-sm px-1 py-1 border rounded text-right focus:ring-2 focus:ring-accent outline-none font-mono"
                style={{
                  background: isErr ? ERROR_BG : "transparent",
                  color: FG_DARK
                }}
                value={row.fecha}
                onChange={e => updateField(i, "fecha", e.target.value)}
                placeholder="MM/AA"
              />
              <input
                className="w-48 text-sm px-1 py-1 border rounded text-right focus:ring-2 focus:ring-accent outline-none font-mono"
                style={{
                  background: isErr ? ERROR_BG : "transparent",
                  color: FG_DARK
                }}
                value={row.capital}
                onChange={e => updateField(i, "capital", e.target.value)}
                placeholder="1.500,50"
              />
              <div className="flex gap-1">
                <button
                  onClick={() => removeRow(i)}
                  className="px-1.5 py-1 text-xs font-bold rounded bg-red-500 text-white hover:bg-red-600"
                  disabled={rows.length === 1}
                  title="Eliminar"
                >
                  {rows.length === 1 ? "~" : "−"}
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

      {/* Total */}
      <div className="px-4 pt-2 pb-4 text-right font-bold text-accent">
        Total: {formatMoney(total)}
      </div>

      {/* Bottom bar */}
      <div className="px-4 pb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRows([{ id: "0", fecha: "", capital: "" }])
              setErrors(new Set())
            }}
            className="px-4 py-1.5 text-sm font-medium rounded bg-red-500 text-white hover:bg-red-600"
          >
            Limpiar tabla
          </button>
          <button
            onClick={() => {
              // TODO: Cargar desde PDF
              alert("Cargar desde PDF proximamente")
            }}
            className="px-4 py-1.5 text-sm font-medium rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Cargar desde PDF
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-1.5 text-sm font-medium rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Volver
          </button>
          <button
            onClick={handleContinue}
            className="px-4 py-1.5 text-sm font-medium rounded bg-accent text-white hover:bg-accent-dark"
            disabled={saving}
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  )
}
