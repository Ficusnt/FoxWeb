import React, { useState } from "react";
import { useFormStore } from "../hooks/useFormStore";
import { useApi } from "../hooks/useApi";
import { Stepper } from "../components/Stepper";
import { useNavigate } from "react-router-dom";

export const Step3Page: React.FC = () => {
  const navigate = useNavigate();
  const {
    sourceType,
    selectedTables,
    setStep,
  } = useFormStore();
  const api = useApi();
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const tableId =
        sourceType === "tablas" && selectedTables.length > 0
          ? selectedTables[0]
          : "default";
      const { pdfUrl } = await api.getTableForPdf(tableId);
      setDownloadUrl(pdfUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error generando el PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handleBack = () => {
    setStep(2.5);
    navigate("/step25");
  };

  const handleStartOver = () => {
    setStep(1);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <Stepper currentStep={3} />
      <div className="max-w-2xl mx-auto">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-red-800 mb-2">
              Error
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : downloadUrl ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-sm font-semibold text-green-800 mb-2">
              PDF listo
            </h3>
            <p className="text-green-700 mb-4">Tu PDF se ha generado correctamente.</p>
            <a
              href={downloadUrl}
              download
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Descargar PDF
            </a>
            <button
              onClick={handleStartOver}
              className="mt-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Generar otro
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Paso 3: Generar PDF
            </h2>
            <p className="text-gray-600 mb-6">
              Revisa tu selección y genera el documento PDF.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-gray-700">Fuente:</span>
                <span className="font-medium text-fox-blue">
                  {sourceType === "tablas" ? "TABLAS" : "PORCENTAJE"}
                </span>
              </div>
              {sourceType === "tablas" && selectedTables.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-gray-700">Tablas:</span>
                  <span className="font-medium text-gray-800">
                    {selectedTables.join(", ")}
                  </span>
                </div>
              )}
            </div>
            <button
              disabled={generating}
              onClick={handleGenerate}
              className="px-6 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium w-full"
            >
              {generating ? "Generando..." : "Generar PDF"}
            </button>
          </div>
        )}
        {!error && !downloadUrl && (
          <div className="flex justify-end">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Atrás
            </button>
          </div>
        )}
      </div>
    </div>
  );
};