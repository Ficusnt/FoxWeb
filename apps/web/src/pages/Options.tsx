import React, { useEffect, useState } from "react";
import { useFormStore } from "../hooks/useFormStore";
import { useApi } from "../hooks/useApi";
import { TableSelect } from "../components/TableSelect";
import { FormFields } from "../components/FormFields";
import { Stepper } from "../components/Stepper";
import { useNavigate } from "react-router-dom";

export const OptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedTableId,
    setSelectedTable,
    setFormFields,
    admin,
    edificio,
    unidad,
    mode,
  } = useFormStore();
  const [tables, setTables] = useState<any[]>([]);
  const loading = false;
  const api = useApi();

  useEffect(() => {
    api.getTables().then((data: any) => {
      setTables(data.tables || []);
    }).catch(() => {
      // API might not be running yet in dev
    });
  }, [api]);

  useEffect(() => {
    setFormFields({ admin, edificio, unidad, mode });
  }, [admin, edificio, unidad, mode, setFormFields]);

  return (
    <div className="space-y-6">
      <Stepper currentStep={2} />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Paso 2: Opciones</h2>
          <p className="text-gray-600 mb-6">
            Selecciona la tabla de coeficientes y completa la información del documento.
          </p>
          <TableSelect tables={tables} selectedId={selectedTableId} onSelect={setSelectedTable} loading={loading} />
          <FormFields
            admin={admin}
            edificio={edificio}
            unidad={unidad}
            mode={mode}
            onChange={(field) => (e) => {
              setFormFields({ [field]: e.target.value });
            }}
          />
        </div>
        <div className="flex justify-between">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Atrás: Datos
          </button>
          <button
            disabled={!selectedTableId || !admin || !edificio || !unidad}
            onClick={() => navigate("/pdf")}
            className="px-6 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Siguiente: Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
};