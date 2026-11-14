import React, { useState, useCallback } from "react";

interface PDFUploadProps {
  onFile?: (file: File) => void;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onFile }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
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
    },
    [onFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver
          ? "border-fox-blue bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
      <div className="space-y-2">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-600">
          Arrastra y suelta un archivo PDF aquí, o haz clic para seleccionar
        </p>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="sr-only"
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-fox-blue focus:ring-offset-2 cursor-pointer"
        >
          Seleccionar archivo
        </label>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Solo archivos PDF. Los coeficientes se ingresan en la tabla abajo.
      </div>
    </div>
  );
};