import React, { useState } from "react";
import Papa from "papaparse";
import type { CoefficientRow } from "../types/index";

interface CSVUploadProps {
  onLoad: (rows: CoefficientRow[]) => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onLoad }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
      setError("Solo se aceptan archivos CSV.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: CoefficientRow[] = results.data
          .map((row: any) => ({
            fecha: String(row.fecha || row.Fecha || row.fecha || "").trim(),
            capital: parseFloat(row.capital || row.Capital || row.captial || 0),
          }))
          .filter(
            (row) =>
              row.fecha.length > 0 &&
              !Number.isNaN(row.capital) &&
              row.capital > 0
          );

        if (rows.length === 0) {
          setError(
            "No se encontraron filas válidas (fecha y capital > 0)."
          );
          return;
        }

        onLoad(rows);
      },
      error: () => {
        setError("No se pudo leer el archivo CSV.");
      },
    });
  };

  return (
    <div className="mt-4">
      {error && (
        <div
          className="mb-3 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-fox-blue transition-colors cursor-pointer relative">
        <input
          type="file"
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />
        <p className="text-gray-500 text-sm">
          📁 Arrastra un CSV o haz clic para subir
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Columnas esperadas: fecha, capital
        </p>
      </div>
    </div>
  );
};