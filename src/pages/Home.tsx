import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Play, List, FileText, Settings } from "lucide-react"

const ACCENT = "#1565c0"
const ACCENT_DARK = "#0d47a1"

export default function Home() {
  const navigate = useNavigate()
  const [scraperStatus, setScraperStatus] = useState<{ ok: boolean; message: string } | null>(null)

  const runScraper = async () => {
    setScraperStatus(null)
    try {
      const r = await fetch("/api/scraper/run", { method: "POST" })
      const data = await r.json()
      setScraperStatus({ ok: data.ok, message: data.message })
    } catch (err: any) {
      setScraperStatus({ ok: false, message: err.message })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#f5f5f5" }}>
      <div className="bg-white p-8 rounded shadow-xl border border-gray-200 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText size={40} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">FOX</h1>
        <p className="text-gray-600 mb-8">Actualizador de valores de expensas</p>

        <div className="space-y-3 mb-8">
          <button
            onClick={() => navigate("/editor")}
            className="w-full px-6 py-3 text-left font-medium text-sm rounded bg-white border border-gray-300 hover:bg-gray-50 flex items-center gap-3"
          >
            <List size={20} className="text-gray-600" />
            <span className="text-gray-800">Editar datos a calcular</span>
          </button>
          <button
            onClick={() => navigate("/scraper")}
            className="w-full px-6 py-3 text-left font-medium text-sm rounded bg-white border border-gray-300 hover:bg-gray-50 flex items-center gap-3"
          >
            <Settings size={20} className="text-gray-600" />
            <span className="text-gray-800">Configurar scraper / tablas</span>
          </button>
          <button
            onClick={() => navigate("/opciones")}
            className="w-full px-6 py-3 text-left font-medium text-sm rounded bg-white border border-gray-300 hover:bg-gray-50 flex items-center gap-3"
          >
            <Play size={20} className="text-gray-600" />
            <span className="text-gray-800">Generar reporte PDF</span>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={runScraper}
            className="w-full px-6 py-3 font-medium text-sm rounded bg-accent text-white hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Play size={18} />
            Ejecutar actualizacion de tablas
          </button>
          {scraperStatus && (
            <div className={`mt-3 p-3 rounded text-sm ${
              scraperStatus.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {scraperStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
