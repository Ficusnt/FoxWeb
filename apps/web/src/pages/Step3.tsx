
import { useFormStore } from '../hooks/useFormStore';
import { PDFUpload } from '../components/PDFUpload';

export default function Step3Page() {
  const {
    adminName,
    street,
    unit,
    sourceType,
    selectedTables,
    selectedPercentage,
    uploadedPdfFileName,
  } = useFormStore();


  const generatePDF = async () => {
    const { PDFDocument, rgb } = await import('pdf-lib');
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);

    const text = `PDF Generado cliente-side
Administración: ${adminName || ''}
Calle - Altura: ${street || ''}
Unidad: ${unit || ''}
Tipo: ${sourceType || ''}
Seleccionado: ${selectedTables?.length ? selectedTables.join(', ') : ''}
Porcentaje: ${selectedPercentage || ''}`;

    page.drawText(text, { x: 50, y: 750, color: rgb(0, 0, 0) });

    const bytes = await doc.save();

    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);

    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = uploadedPdfFileName || 'coeficientes.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {uploadedPdfFileName && (
        <div>
          <p>PDF listo: {uploadedPdfFileName}</p>
          <button onClick={generatePDF}>Descargar PDF</button>
        </div>
      )}
      {!uploadedPdfFileName && (
        <p className="text-sm text-gray-500">Nombre de archivo: aún no establecido</p>
      )}
      <PDFUpload onFile={(file) => {
        useFormStore.getState().setUploadedPdfFileName(file.name);
      }} />
    </div>
  );
}
