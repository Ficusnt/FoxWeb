import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Download, ArrowLeft, FileText, CheckCircle } from "lucide-react"

const ACCENT = "#1565c0"
const ACCENT_DARK = "#0d47a1"

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f5f5" }}>
      <div className="bg-white p-8 rounded shadow-xl border border-gray-200 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">PDF generado</h1>
        <p className="text-gray-600 mb-6">
          Su reporte esta listo para descargar.
        </p>
        <button
          onClick={handleDownload}
          className={`w-full px-4 py-2 rounded font-medium text-white transition ${downloaded ? "bg-gray-400" : `bg-${ACCENT} hover:bg-${ACCENT_DARK}`}`}
          disabled={downloaded}
        >
          {downloaded ? "Descargado" : "Descargar PDF"}
        </button>
        <div className="mt-6">
          <button
            onClick={() => navigate("/editor")}
            className="px-4 py-1.5 text-sm font-medium rounded bg-gray-500 text-white hover:bg-gray-600"
          >
            Nuevo reporte
          </button>
          <button
            onClick={() => navigate("/")}
            className="ml-2 px-4 py-1.5 text-sm font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Inicio
          </button>
        </div>
      </div>
    </div>
  )
}
