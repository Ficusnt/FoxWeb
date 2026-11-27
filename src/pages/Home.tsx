import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Settings, Play, ArrowRight } from "lucide-react"
import Layout from "../components/Layout"
import { apiFetch } from "../lib/api"

export default function Home() {
  const navigate = useNavigate()
  const [scraperStatus, setScraperStatus] = useState<{ ok: boolean; message: string } | null>(null)

  const runScraper = async () => {
    setScraperStatus(null)
    try {
      const r = await apiFetch("/api/scraper/run", { method: "POST" })
      const data = await r.json()
      setScraperStatus({ ok: data.ok, message: data.message })
    } catch (err: any) {
      setScraperStatus({ ok: false, message: err.message })
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="w-16 h-16 bg-fox-blue/10 rounded-none flex items-center justify-center mb-6 text-fox-blue border border-fox-blue">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl font-display font-bold text-fox-ink mb-4">FOX</h1>
          <p className="text-lg text-gray-600">
            Actualizador de valores de expensas — coeficientes de agendae.com.ar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="fox-card">
            <div className="fox-card-header">
              <FileText size={24} className="text-gray-600" />
              <div>
                <h3 className="fox-card-title">Datos a calcular</h3>
                <p className="fox-card-desc">Ingresar fechas y capitales</p>
              </div>
            </div>
            <div className="fox-card-footer">
              <button
                onClick={() => navigate("/editor")}
                className="btn btn-primary w-full"
              >
                Ir a datos
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="fox-card">
            <div className="fox-card-header">
              <Settings size={24} className="text-gray-600" />
              <div>
                <h3 className="fox-card-title">Configurar scraper</h3>
                <p className="fox-card-desc">Tablas y retención</p>
              </div>
            </div>
            <div className="fox-card-footer">
              <button
                onClick={() => navigate("/scraper")}
                className="btn btn-primary w-full"
              >
                Configurar
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="fox-card">
            <div className="fox-card-header">
              <Play size={24} className="text-gray-600" />
              <div>
                <h3 className="fox-card-title">Generar reporte</h3>
                <p className="fox-card-desc">PDF con cálculos</p>
              </div>
            </div>
            <div className="fox-card-footer">
              <button
                onClick={() => navigate("/")}
                className="btn btn-primary w-full"
              >
                Generar PDF
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="fox-card mt-8">
          <div className="fox-card-header">
            <Play size={20} className="text-white" />
            <div>
              <h3 className="fox-card-title">Actualizar tablas desde agendae.com.ar</h3>
              <p className="fox-card-desc">Descarga los coeficientes más recientes del servidor</p>
            </div>
          </div>
          <div className="p-6">
            <button
              onClick={runScraper}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Ejecutar actualización de tablas
            </button>
            {scraperStatus && (
              <div
                className={`mt-4 p-4 rounded-none border ${
                  scraperStatus.ok
                    ? "border-fox-green bg-green-50 text-fox-green"
                    : "border-fox-red bg-red-50 text-fox-red"
                }`}
              >
                {scraperStatus.ok ? (
                  <svg className="w-5 h-5 text-fox-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-fox-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {scraperStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
