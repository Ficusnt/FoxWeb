import React from "react";
import Papa from "papaparse";
import type { CoefficientRow } from "../types/index";

interface CSVUploadProps {
  onLoad: (rows: CoefficientRow[]) => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onLoad }) => {
  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: CoefficientRow[] = results.data.map((row: any) => ({
          fecha: row.fecha || row.Fecha || row.fecha || "",
          capital: parseFloat(row.capital || row.Capital || row.captial || 0) || 0,
        }));
        onLoad(rows);
      },
    });
  };

  return (
    <div className="mt-4">
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