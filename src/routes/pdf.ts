import { Hono } from "hono";
import type { PDFParams, CoefficientTable, Env } from "../types/index";
import { getTable } from "../lib/storage";
import { PDFDocument, rgb } from "pdf-lib";

const pdf = new Hono<{ Bindings: Env }>();

// Generate PDF for a specific table
pdf.get("/:tableId", async (c) => {
  const tableId = c.req.param("tableId");
  const table = await getTable(c.env.TABLES_KV, tableId);

  if (!table) {
    return c.json({ error: "Table not found" }, 404);
  }

  // Generate PDF content using pdf-lib
  const pdfContent = await generatePdfContentWithLib(table);

  const fileName = `${table.name || tableId}.pdf`;

  return c.body(pdfContent, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "application/pdf",
    },
  });
});

// Generate PDF with parameters
pdf.post("/generate", async (c) => {
  const params = await c.req.json<PDFParams>();

  // Validate required parameters
  if (!params.tableId || !params.tableName) {
    return c.json({ error: "Missing tableId or tableName" }, 400);
  }

  const table = await getTable(c.env.TABLES_KV, params.tableId);

  if (!table) {
    return c.json({ error: "Table not found" }, 404);
  }

  const pdfContent = await generatePdfContentWithLib(table, params);

  return c.body(pdfContent, {
    headers: {
      "Content-Disposition": `attachment; filename="${params.tableName}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
});

export default pdf;

/**
 * Generate PDF using pdf-lib library
 */
async function generatePdfContentWithLib(
  table: CoefficientTable,
  params?: PDFParams
): Promise<ArrayBuffer> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a page
  const page = pdfDoc.addPage([612, 792]); // Letter size

  // Get the page's drawing context
  const { width, height } = page.getSize();

  // Add title
  const timesFont = await pdfDoc.embedFont("helvetica");
  page.drawText("Coefficient Table", {
    x: 50,
    y: height - 50,
    font: timesFont,
    size: 24,
    color: rgb(0, 0, 0),
  });

  // Add table data
  let y = height - 100;
  const rowHeight = 20;

  // Headers
  page.drawText("Date", {
    x: 50,
    y,
    font: timesFont,
    size: 14,
    color: rgb(0, 0, 0),
  });

  page.drawText("Capital", {
    x: 150,
    y,
    font: timesFont,
    size: 14,
    color: rgb(0, 0, 0),
  });

  y -= rowHeight;

  // Data rows
  table.data.forEach((row: any, index) => {
    page.drawText(row.fecha, {
      x: 50,
      y,
      font: timesFont,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(String(row.capital), {
      x: 150,
      y,
      font: timesFont,
      size: 14,
      color: rgb(0, 0, 0),
    });

    y -= rowHeight;

    if (y < 50) {
      // Add a new page if we run out of space
      const newPage = pdfDoc.addPage([612, 792]);
      y = newPage.getHeight() - 50;
    }
  });

  // Save the PDF and return as ArrayBuffer
  const pdfBytes = await pdfDoc.save();

  return pdfBytes;
}