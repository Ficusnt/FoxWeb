/**
 * pdf.ts — PDF generation for FoxCapital reports.
 * Ported from fox.py write_output() (FoxReloaded).
 *
 * Uses pdf-lib (pure TS/JS, Workers-compatible) to generate PDF reports
 * with header, meta info, data table, zebra rows, totals, and errors.
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import type { PdfReport } from "../types"

const MM_TO_PT = 2.83464567  // 1 mm = 2.83464567 pt
const PAGE_WIDTH = 210 * MM_TO_PT   // A4 width in points (~595)
const PAGE_HEIGHT = 297 * MM_TO_PT  // A4 height in points (~842)
const SIDE_MARGIN = 10 * MM_TO_PT
const CE_FL_MARGIN = 12 * MM_TO_PT

const CLR_DARK = rgb(0.102, 0.102, 0.182)      // #1a1a2e
const CLR_GREY_L = rgb(0.961, 0.961, 0.961)   // #f5f5f5
const CLR_GREY_B = rgb(0.910, 0.918, 0.965)   // #e8eaf6
const CLR_GREY_G = rgb(0.800, 0.800, 0.800)   // #cccccc
const CLR_RED = rgb(0.753, 0.224, 0.169)      // #c0392b
const CLR_WHITE = rgb(1, 1, 1)
const CLR_GREY_META = rgb(0.4, 0.4, 0.4)

/**
 * Calculate proportional column widths based on max character count per column.
 */
function colWidths(
  headers: string[],
  rows: string[][],
  totals: string[] | null,
  availW: number
): number[] {
  const n = headers.length
  const maxC = headers.map(h => h.length)
  const allRows = [headers, ...rows]
  if (totals) allRows.push(totals)
  for (const row of allRows) {
    for (let i = 0; i < n; i++) {
      maxC[i] = Math.max(maxC[i], String(row[i] ?? "").length)
    }
  }
  const padded = maxC.map(c => c + 4)
  const total = padded.reduce((a, b) => a + b, 0) || 1
  return padded.map(c => (c / total) * availW)
}

/**
 * Draw page number bottom-right.
 */
function drawPageNumber(page: any, pageNum: number): void {
  const fontSize = 8
  const width = page.getWidth()
  const height = page.getHeight()
  page.drawText(String(pageNum), {
    x: width - SIDE_MARGIN - 6 * MM_TO_PT,
    y: 6 * MM_TO_PT,
    size: fontSize,
    color: CLR_GREY_META
  })
}

/**
 * Generate a PDF report as a Uint8Array.
 */
export async function generatePdf(report: PdfReport): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const availW = PAGE_WIDTH - SIDE_MARGIN * 2
  const colW = colWidths(report.headers, report.rows.map(r => Object.values(r)), report.totals, availW)

  let y = PAGE_HEIGHT - CE_FL_MARGIN

  // ── Study name (title) ──
  if (report.title) {
    page.drawText(report.title, {
      x: SIDE_MARGIN,
      y,
      size: 12,
      font: boldFont,
      color: CLR_DARK
    })
    y -= 14 + 4
  }

  // ── Meta lines ──
  for (const line of report.meta) {
    page.drawText(line, {
      x: SIDE_MARGIN,
      y,
      size: 9,
      font,
      color: CLR_GREY_META
    })
    y -= 11
  }
  y -= 8

  // ── Table header ──
  const headerHeight = 18
  const colAlign: ("left" | "center" | "right")[] = report.align.map(
    a => (a === "l" ? "left" : a === "c" ? "center" : "right")
  )

  // Header background
  page.drawRectangle({
    x: SIDE_MARGIN,
    y: y - headerHeight,
    width: availW,
    height: headerHeight,
    color: CLR_DARK
  })

  let cx = SIDE_MARGIN
  for (let i = 0; i < report.headers.length; i++) {
    const h = report.headers[i]
    const textColor = CLR_WHITE
    const textFont = boldFont
    const textSize = 9

    // Multi-line header support
    const lines = h.split("\n")
    const lineHeight = 11
    const startY = y - headerHeight / 2 - (lines.length - 1) * lineHeight / 2 + 4

    page.drawText(lines.join(" "), {
      x: cx + 4,
      y: startY,
      size: textSize,
      font: textFont,
      color: textColor
    })
    cx += colW[i]
  }

  y -= headerHeight

  // ── Data rows ──
  const rowHeight = 14
  const fontSize = 9

  for (let rowIdx = 0; rowIdx < report.rows.length; rowIdx++) {
    const row = report.rows[rowIdx]
    const rowValues = Object.values(row)
    const isError = !!report.errors[rowIdx]

    // Alternating row shading
    if (rowIdx % 2 === 1) {
      page.drawRectangle({
        x: SIDE_MARGIN,
        y: y - rowHeight,
        width: availW,
        height: rowHeight,
        color: CLR_GREY_L
      })
    }

    cx = SIDE_MARGIN
    for (let colIdx = 0; colIdx < rowValues.length; colIdx++) {
      const val = String(rowValues[colIdx] ?? "")
      const color = isError ? CLR_RED : rgb(0, 0, 0)
      const textFont = colAlign[colIdx] === "right" ? font : font

      const textX =
        colAlign[colIdx] === "right"
          ? cx + colW[colIdx] - 4 - val.length * (fontSize * 0.5)
          : colAlign[colIdx] === "center"
            ? cx + colW[colIdx] / 2 - val.length * (fontSize * 0.25)
            : cx + 4

      page.drawText(val, {
        x: textX,
        y: y - rowHeight + 4,
        size: fontSize,
        font: textFont,
        color
      })

      cx += colW[colIdx]
    }

    y -= rowHeight
  }

  // ── Totals row ──
  if (report.totals) {
    page.drawRectangle({
      x: SIDE_MARGIN,
      y: y - rowHeight,
      width: availW,
      height: rowHeight,
      color: CLR_GREY_B
    })

    cx = SIDE_MARGIN
    for (let colIdx = 0; colIdx < report.totals.length; colIdx++) {
      const val = String(report.totals[colIdx] ?? "")
      const textX =
        colAlign[colIdx] === "right"
          ? cx + colW[colIdx] - 4 - val.length * (fontSize * 0.5)
          : cx + 4

      page.drawText(val, {
        x: textX,
        y: y - rowHeight + 4,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0)
      })
      cx += colW[colIdx]
    }

    y -= rowHeight
  }

  drawPageNumber(page, 1)

  return pdfDoc.save()
}
