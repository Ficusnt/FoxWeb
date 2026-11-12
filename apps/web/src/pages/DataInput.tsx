import { useFormStore } from "../hooks/useFormStore";
import { DataTable } from "../components/DataTable";
import { CSVUpload } from "../components/CSVUpload";
import { Stepper } from "../components/Stepper";
import { useNavigate } from "react-router-dom";

export const DataInputPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    rows,
    addRow,
    removeRow,
    updateRow,
    loadCSV,
  } = useFormStore();

  const handleContinue = () => {
    navigate("/options");
  };

  return (
    <div className="space-y-6">
      <Stepper currentStep={1} />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Paso 1: Datos de Coeficientes</h2>
          <p className="text-gray-600 mb-6">
            Ingresa los coeficientes mes por mes. Puedes agregar filas manualmente o importar desde un CSV.
          </p>
          <CSVUpload onLoad={loadCSV} />
          <DataTable
            rows={rows}
            onUpdateRow={updateRow}
            onAddRow={addRow}
            onRemoveRow={removeRow}
          />
        </div>
        <div className="flex justify-end">
          <button
            disabled={rows.length === 0 || rows.some((r) => !r.fecha || r.capital === 0)}
            onClick={handleContinue}
            className="px-6 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Siguiente: Opciones
          </button>
        </div>
      </div>
    </div>
  );
};