import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle, ArrowRight } from "lucide.react"
import Layout from "../components/Layout"
import Button from "../components/Button"

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
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Reporte listo</h1>
          <p className="text-gray-600 mb-8">
            Su PDF ha sido generado correctamente y está listo para descargar.
          </p>

          <Button
            onClick={handleDownload}
            variant="default"
            disabled={downloaded}
            className="w-full flex items-center justify-center gap-2 mb-6"
          >
            {downloaded ? "Descargado" : "Descargar PDF"}
            {!downloaded && <ArrowRight size={16} />}
          </Button>

          <div className="flex gap-3">
            <Button onClick={() => navigate("/editor")} variant="outline">
              Nuevo reporte
            </Button>
            <Button onClick={() => navigate("/")} variant="ghost">
              Inicio
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
