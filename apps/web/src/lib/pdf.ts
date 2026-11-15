import { PDFDocument, rgb, StandardFonts } from \ pdf-lib\;
import type { PDFParams } from \../types/index\;

const PAGE_WIDTH = 595.28; // A4 portrait width in points
const PAGE_HEIGHT = 841.89; // A4 portrait height in points
const MARGIN = 50;
const ROW_HEIGHT = 20;
const HEADER_ROW_HEIGHT = 24;

export async function generatePercentPDF(
  params: PDFParams
): Promise<Uint8Array> {
  return generateTablePDF({ ...params, mode: \porcentaje\ });
}

export async function generateTablePDF(params: PDFParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;

  // Header info
  page.drawText(Admin: , {
    x: MARGIN,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 18;
  page.drawText(Edificio: , {
    x: MARGIN,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 18;
  page.drawText(Unidad: , {
    x: MARGIN,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Table title
  const title = params.mode === \tabla\ ? \TABLA DE CAPITAL\ : \TABLA DE PORCENTAJE\;
  page.drawText(title, {
    x: MARGIN,
    y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  y -= 24;

  // Table headers
  const col1X = MARGIN;
  const col2X = MARGIN + 200;
  const colWidth = 200;

  // Draw header background
  page.drawRectangle({
    x: MARGIN,
    y: y - HEADER_ROW_HEIGHT + 4,
    width: colWidth,
    height: HEADER_ROW_HEIGHT,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText(\FECHA\, {
    x: col1X + 8,
    y: y - HEADER_ROW_HEIGHT + 10,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  page.drawText(params.mode === \tabla\ ? \CAPITAL\ : \PORCENTAJE\, {
    x: col2X + 8,
    y: y - HEADER_ROW_HEIGHT + 10,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  y -= HEADER_ROW_HEIGHT;

  // Draw rows
  const sortedRows = [...params.rows].sort((a, b) => {
    const [aM, aY] = a.fecha.split(\/\).map(Number);
    const [bM, bY] = b.fecha.split(\/\).map(Number);
    if (aY !== bY) return aY - bY;
    return aM - bM;
  });

  for (const row of sortedRows) {
    // Draw row background (alternating)
    if (sortedRows.indexOf(row) % 2 === 1) {
      page.drawRectangle({
        x: MARGIN,
        y: y - ROW_HEIGHT + 2,
        width: colWidth,
        height: ROW_HEIGHT,
        color: rgb(0.97, 0.97, 0.97),
      });
    }

    page.drawText(row.fecha, {
      x: col1X + 8,
      y: y - ROW_HEIGHT + 6,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    const value =
      params.mode === \tabla\
        ? row.capital.toFixed(2)
        : ((row.capital / 100) * 100).toFixed(2); // placeholder for percentage logic

    page.drawText(value, {
      x: col2X + 8,
      y: y - ROW_HEIGHT + 6,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    y -= ROW_HEIGHT;
  }

  // Totals row
  y -= 10;
  const totalCapital = sortedRows.reduce((sum, r) => sum + r.capital, 0);
  page.drawRectangle({
    x: MARGIN,
    y: y - ROW_HEIGHT + 2,
    width: colWidth,
    height: ROW_HEIGHT,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText(\TOTAL\, {
    x: col1X + 8,
    y: y - ROW_HEIGHT + 6,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  page.drawText(totalCapital.toFixed(2), {
    x: col2X + 8,
    y: y - ROW_HEIGHT + 6,
    size: 10,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export async function downloadPdf(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: \application/pdf\ });
  const url = URL.createObjectURL(blob);
  const link = document.createElement(\a\);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
