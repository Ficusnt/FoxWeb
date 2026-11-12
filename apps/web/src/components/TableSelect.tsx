import React from "react";
import type { TableConfig } from "../types/index";

interface TableSelectProps {
  tables: TableConfig[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export const TableSelect: React.FC<TableSelectProps> = ({
  tables,
  selectedId,
  onSelect,
  loading,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Seleccionar Tabla de Coeficientes</label>
      <select
        value={selectedId || ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fox-blue bg-white disabled:bg-gray-100"
      >
        <option value="">-- Seleccionar una tabla --</option>
        {tables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.folder})
          </option>
        ))}
      </select>
      {selectedId && (
        <p className="text-xs text-gray-500">Tabla: {tables.find((t) => t.id === selectedId)?.name}</p>
      )}
    </div>
  );
};