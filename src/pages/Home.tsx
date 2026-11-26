import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Settings, Play, ArrowRight } from "lucide-react"
import Layout from "../components/Layout"
import Button from "../components/Button"
import Card from "../components/Card"

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
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 text-accent">
            <FileText size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">FOX</h1>
          <p className="text-lg text-gray-600">
            Actualizador de valores de expensas — coeficientes de agendae.com.ar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <Card.Header>
              <FileText size={24} className="text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Datos a calcular</h3>
                <p className="text-sm text-gray-500">Ingresar fechas y capitales</p>
              </div>
            </Card.Header>
            <Card.Footer>
              <Button onClick={() => navigate("/editor")} variant="default" size="sm" className="w-full">
                Ir a Datos <ArrowRight size={16} />
              </Button>
            </Card.Footer>
          </Card>

          <Card>
            <Card.Header>
              <Settings size={24} className="text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Configurar scraper</h3>
                <p className="text-sm text-gray-500">Tablas y retención</p>
              </div>
            </Card.Header>
            <Card.Footer>
              <Button onClick={() => navigate("/scraper")} variant="default" size="sm" className="w-full">
                Configurar <ArrowRight size={16} />
              </Button>
            </Card.Footer>
          </Card>

          <Card>
            <Card.Header>
              <Play size={24} className="text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generar reporte</h3>
                <p className="text-sm text-gray-500">PDF con cálculos</p>
              </div>
            </Card.Header>
            <Card.Footer>
              <Button onClick={() => navigate("/wizard")} variant="default" size="sm" className="w-full">
                Generar PDF <ArrowRight size={16} />
              </Button>
            </Card.Footer>
          </Card>
        </div>

        <Card className="mt-8">
          <Card.Header>
            <Play size={20} className="text-white" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Actualizar tablas desde agendae.com.ar</h3>
              <p className="text-sm text-gray-500">Descarga los coeficientes más recientes del servidor</p>
            </div>
          </Card.Header>
          <div className="p-6">
            <Button
              onClick={runScraper}
              variant="default"
              className="w-full flex items-center justify-center gap-2"
            >
              <Play size={18} />
              Ejecutar actualización de tablas
            </Button>
            {scraperStatus && (
              <div
                className={`mt-4 p-4 rounded-lg text-sm flex items-center gap-3 ${
                  scraperStatus.ok
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {scraperStatus.ok ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {scraperStatus.message}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}
