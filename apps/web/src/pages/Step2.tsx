import React from "react";
import { useFormStore } from "../hooks/useFormStore";
import { Stepper } from "../components/Stepper";
import { DataTable } from "../components/DataTable";
import { PDFUpload } from "../components/PDFUpload";
import { useNavigate } from "react-router-dom";

export const Step2Page: React.FC = () => {
  const navigate = useNavigate();
  const {
    rows,
    addRow,
    removeRow,
    updateRow,
    clearRows,
    sourceType,

    setStep,
    setUploadedPdfFileName,
  } = useFormStore();

  const handleContinue = () => {
    const valid =
      rows.length > 0 &&
      rows.every((r) => r.fecha && r.capital > 0);
    if (!valid) return;
    setStep(2.5);
    navigate("/step25");
  };

  const handleBack = () => {
    setStep(1);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <Stepper currentStep={2} />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Paso 2: Ingresar Datos
          </h2>
          <p className="text-gray-600 mb-6">
            Ingresa los coeficientes mes por mes. Agrega filas manualmente o
            sube un archivo PDF de origen.
          </p>
          <div className="mb-4 text-xs text-gray-500">
            Fuente seleccionada:{" "}
            {sourceType === "tablas" ? "TABLAS" : "PORCENTAJE"}
          </div>
          <PDFUpload onFile={(file) => setUploadedPdfFileName(file.name)} />
          <DataTable
            rows={rows}
            onUpdateRow={updateRow}
            onAddRow={addRow}
            onRemoveRow={removeRow}
            onClearRows={clearRows}
          />
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Atrás
          </button>
          <button
            disabled={
              rows.length === 0 ||
              rows.some((r) => !r.fecha || r.capital === 0)
            }
            onClick={handleContinue}
            className="px-6 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Siguiente: Selección
          </button>
        </div>
      </div>
    </div>
  );
};