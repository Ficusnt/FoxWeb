import React from "react";
import type { CoefficientRow } from "../types/index";

interface DataTableProps {
  rows: CoefficientRow[];
  onUpdateRow: (index: number, field: "fecha" | "capital", value: string | number) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onClearRows: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  rows,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  onClearRows,
}) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-gray-800">Datos de Coeficientes</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onClearRows}
            disabled={rows.length === 0}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Eliminar todos
          </button>
          <button
            onClick={onAddRow}
            className="text-xs bg-fox-blue text-white px-2 py-1 rounded hover:bg-fox-dark transition-colors"
          >
            + Agregar fila
          </button>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600">Fecha (MM/YY)</th>
            <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600">Capital</th>
            <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={row.fecha}
                  placeholder="MM/YY"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fox-blue"
                  onChange={(e) => onUpdateRow(index, "fecha", e.target.value)}
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={row.capital != null ? row.capital.toString() : ''}
                  placeholder="0.00"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fox-blue"
                  onChange={(e) => onUpdateRow(index, "capital", e.target.value)}
                />
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onRemoveRow(index)}
                  disabled={rows.length === 1}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};