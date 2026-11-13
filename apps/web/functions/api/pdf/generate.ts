import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type PDFParams = {
  tableId: string;
  tableName: string;
  admin: string;
  edificio: string;
  unidad: string;
  mode: "tabla" | "porcentaje";
  rows: { fecha: string; capital: number }[];
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const ROW_HEIGHT = 20;
const HEADER_ROW_HEIGHT = 24;

async function generateTablePDF(params: PDFParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;

  page.drawText(`Admin: ${params.admin}`, { x: MARGIN, y, size: 12, font, color: rgb(0, 0, 0) });
  y -= 18;
  page.drawText(`Edificio: ${params.edificio}`, { x: MARGIN, y, size: 12, font, color: rgb(0, 0, 0) });
  y -= 18;
  page.drawText(`Unidad: ${params.unidad}`, { x: MARGIN, y, size: 12, font, color: rgb(0, 0, 0) });
  y -= 30;

  const title = params.mode === "tabla" ? "TABLA DE CAPITAL" : "TABLA DE PORCENTAJE";
  page.drawText(title, { x: MARGIN, y, size: 14, font: boldFont, color: rgb(0, 0, 0) });
  y -= 24;

  // Header row
  page.drawText("Fecha", { x: MARGIN, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
  page.drawText("Capital", { x: MARGIN + 100, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
  y -= HEADER_ROW_HEIGHT;

  // Data rows
  for (const row of params.rows) {
    page.drawText(row.fecha, { x: MARGIN, y, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText(String(row.capital), { x: MARGIN + 100, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= ROW_HEIGHT;
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  const body: PDFParams = await request.json();
  const pdfBytes = await generateTablePDF(body);

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${body.tableId}.pdf"`,
    },
  });
};