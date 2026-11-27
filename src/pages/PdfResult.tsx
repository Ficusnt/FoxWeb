import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle, ArrowRight } from "lucide-react"
import Layout from "../components/Layout"

export default function PdfResult() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pdfUrl = searchParams.get("url") || ""
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = () => {
    if (!pdfUrl) return
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `reporte_${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1500)
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-none flex items-center justify-center mb-6 border border-fox-green">
            <CheckCircle size={32} className="text-fox-green" />
          </div>
          <h1 className="text-3xl font-display font-bold text-fox-ink mb-3">Reporte listo</h1>
          <p className="text-gray-600 mb-8">
            Su PDF ha sido generado correctamente y está listo para descargar.
          </p>

          <button
            onClick={handleDownload}
            className="btn btn-primary w-full flex items-center justify-center gap-2 mb-6"
            disabled={downloaded}
          >
            {downloaded ? "Descargado" : "Descargar PDF"}
            {!downloaded && <ArrowRight size={16} />}
          </button>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/editor")}
              className="btn btn-ghost"
            >
              Nuevo reporte
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn btn-ghost"
            >
              Inicio
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
