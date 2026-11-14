import React, { useState, useEffect } from "react";
import { useFormStore } from "../hooks/useFormStore";
import { useApi } from "../hooks/useApi";
import { Stepper } from "../components/Stepper";
import { useNavigate } from "react-router-dom";
import type { TableConfig } from "../types/index";

export const Step1Page: React.FC = () => {
  const navigate = useNavigate();
  const { setSourceType, setStep, currentStep } = useFormStore();
  const api = useApi();
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSource, setSelectedSource] = useState<"tablas" | "porcentaje" | null>(null);

  useEffect(() => {
    api.getTableConfig().then(({ tables }) => {
      setTables(tables ?? []);
    }).catch(() => {
      setTables([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleContinue = () => {
    if (!selectedSource) return;
    setSourceType(selectedSource);
    setStep(2);
    navigate("/step2");
  };

  const isRevision = currentStep === 1 && tables.length > 0 && !selectedSource;

  return (
    <div className="space-y-6">
      <Stepper currentStep={1} />
      <div className="max-w-2xl mx-auto">
        {isRevision ? (
          <RevisionView tables={tables} />
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Paso 1: Seleccionar Fuente</h2>
            <p className="text-gray-600 mb-6">
              Elige qué tipo de tabla quieres generar:
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedSource("tablas")}
                className={`w-full py-3 rounded-lg border text-left font-medium transition-colors ${selectedSource === "tablas" ? "bg-fox-blue text-white border-fox-blue" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              >
                TABLAS
              </button>
              <button
                onClick={() => setSelectedSource("porcentaje")}
                className={`w-full py-3 rounded-lg border text-left font-medium transition-colors ${selectedSource === "porcentaje" ? "bg-fox-blue text-white border-fox-blue" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              >
                PORCENTAJE
              </button>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                disabled={!selectedSource || loading}
                onClick={handleContinue}
                className={
                  !selectedSource
                    ? "px-6 py-2 bg-gray-400 text-white rounded-lg disabled:cursor-not-allowed"
                    : "px-6 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark transition-colors text-sm font-medium"
                }
              >
                Siguiente: Datos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function RevisionView({ tables }: { tables: TableConfig[] }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Revisión de Tablas</h2>
      <p className="text-gray-600 mb-4">
        Tablas configuradas disponibles para revisar y re-scrapear:
      </p>
      {tables.length === 0 ? (
        <p className="text-gray-500">No hay tablas configuradas.</p>
      ) : (
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600">ID</th>
              <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600">URL</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-sm text-gray-700">{t.id}</td>
                <td className="px-4 py-2 text-gray-700">{t.name}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-500 break-all">{t.url}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
