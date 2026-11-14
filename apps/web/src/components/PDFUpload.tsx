import React, { useState } from "react";

interface PDFUploadProps {
  onFile?: (file: File) => void;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onFile }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Solo se aceptan archivos PDF.");
      return;
    }

    setFileName(file.name);
    onFile?.(file);
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
      {fileName && (
        <div
          className="mb-3 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm"
        >
          Archivo PDF seleccionado: {fileName}
        </div>
      )}
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      <div className="mt-2 text-xs text-gray-500">
        Solo archivos PDF. Los coeficientes se ingresan en la tabla abajo.
      </div>
    </div>
  );
};