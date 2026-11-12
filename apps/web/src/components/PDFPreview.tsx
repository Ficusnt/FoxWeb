import React from "react";

interface PDFPreviewProps {
  pdfUrl: string | null;
  filename: string;
  onDownload: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  pdfUrl,
  filename,
  onDownload,
}) => {
  if (!pdfUrl) return null;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">PDF Generado</h3>
      <div className="flex flex-col items-center gap-4">
        <embed
          src={pdfUrl}
          type="application/pdf"
          className="w-full max-w-md h-64 border border-gray-200 rounded-lg"
        />
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark transition-colors text-sm font-medium"
          >
            Descargar PDF
          </button>
          <a
            href={pdfUrl}
            download={filename}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Abrir en nueva pestaña
          </a>
        </div>
      </div>
    </div>
  );
};