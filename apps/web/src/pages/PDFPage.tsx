import React, { useEffect } from "react";
import { useFormStore } from "../hooks/useFormStore";
import { generateTablePDF } from "../lib/pdf";
import { PDFPreview } from "../components/PDFPreview";
import { Stepper } from "../components/Stepper";

export const PDFPage: React.FC = () => {
  const {
    rows,
    selectedTableId,
    admin,
    edificio,
    unidad,
    mode,
    pdfUrl,
    setPdfUrl,
  } = useFormStore();

  useEffect(() => {
    const generate = async () => {
      if (!selectedTableId || !admin || !edificio || !unidad) return;

      const params = {
        tableId: selectedTableId,
        tableName: selectedTableId,
        admin,
        edificio,
        unidad,
        mode,
        rows,
      };

      try {
        const pdfBytes = await generateTablePDF(params);
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("PDF generation failed:", err);
      }
    };

    generate();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [rows, selectedTableId, admin, edificio, unidad, mode, pdfUrl, setPdfUrl]);

  const handleDownload = () => {
    if (!pdfUrl || !selectedTableId) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `coeficientes-${selectedTableId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Stepper currentStep={3} />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Paso 3: Generar PDF</h2>
          <p className="text-gray-600 mb-6">
            El PDF se ha generado con los coeficientes ingresados.
          </p>
          {pdfUrl ? (
            <PDFPreview pdfUrl={pdfUrl} filename={`coeficientes-${selectedTableId}.pdf`} onDownload={handleDownload} />
          ) : (
            <div className="text-center py-10 text-gray-500">Generando PDF...</div>
          )}
        </div>
        <div className="flex justify-between">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Atrás: Opciones
          </button>
          <button
            className="px-6 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark transition-colors text-sm font-medium"
            onClick={() => window.location.reload()}
          >
            Nuevo PDF
          </button>
        </div>
      </div>
    </div>
  );
};