import React, { useState, useEffect } from "react";
import { useFormStore } from "../hooks/useFormStore";
import { useApi } from "../hooks/useApi";
import { Stepper } from "../components/Stepper";
import { useNavigate } from "react-router-dom";
import type { TableConfig } from "../types/index";

interface TableRowOption {
  id: string;
  name: string;
  checked: boolean;
}

export const Step25Page: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedTables, setStep } = useFormStore();
  const api = useApi();
  const [tables, setTables] = useState<TableRowOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTableConfig().then((data) => {
      const tables = data?.tables ?? [];
      setTables(
        tables.map((t: TableConfig) => ({
          id: t.id,
          name: t.name,
          checked: false,
        }))
      );
      setLoading(false);
    }).catch(() => {
      setTables([]);
      setLoading(false);
    });
  }, []);

  const handleToggle = (id: string) => {
    setTables(
      tables.map((t) =>
        t.id === id ? { ...t, checked: !t.checked } : t
      )
    );
  };

  const handleContinue = () => {
    const selected = tables.filter((t) => t.checked).map((t) => t.id);
    if (selected.length === 0) return;
    setSelectedTables(selected);
    setStep(3);
    navigate("/step3");
  };

  const handleBack = () => {
    setStep(2);
    navigate("/step2");
  };

  return (
    <div className="space-y-6">
      <Stepper currentStep={2.5} />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Paso 2.5: Seleccionar Tablas
          </h2>
          <p className="text-gray-600 mb-6">
            Elige las tablas de fuente para generar el PDF:
          </p>
          {loading ? (
            <p className="text-gray-500">Cargando tablas...</p>
          ) : tables.length === 0 ? (
            <p className="text-gray-500">No hay tablas configuradas.</p>
          ) : (
            <div className="space-y-2">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleToggle(t.id)}
                >
                  <input
                    type="checkbox"
                    checked={t.checked}
                    onChange={() => handleToggle(t.id)}
                    className="w-4 h-4 text-fox-blue rounded border-gray-300 focus:ring-fox-blue"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Atrás
          </button>
          <button
            disabled={!tables.some((t) => t.checked)}
            onClick={handleContinue}
            className="px-6 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Siguiente: PDF
          </button>
        </div>
      </div>
    </div>
  );
};