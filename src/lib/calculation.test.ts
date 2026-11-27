import { describe, it, expect } from "vitest"
import { fromTabla, fromPercent } from "./calculation"
import { parseCsvMatrix } from "./calculation"

const csvMatrix = {
  "ENE.": { 2026: 1.050, 2025: 1.040 },
  "FEB.": { 2026: 1.040 },
  "MAR.": { 2026: 1.030 }
}

describe("parseCsvMatrix", () => {
  it("parses CSV into month/year matrix", () => {
    const csv = "Mes,2026,2025\nENE.,1.050,1.040\nFEB.,1.040,\n"
    const result = parseCsvMatrix(csv)
    expect(result["ENE."][2026]).toBe(1.05)
    expect(result["ENE."][2025]).toBe(1.04)
    expect(result["FEB."][2026]).toBe(1.04)
    expect(result["FEB."][2025]).toBeUndefined()
  })

  it("returns empty object for empty CSV", () => {
    expect(parseCsvMatrix("")).toEqual({})
  })
})

describe("fromTabla", () => {
  it("calculates interest with coefficient table", () => {
    const report = fromTabla(
      [{ date: "01/26", capital: 1000 }],
      csvMatrix,
      1,
      "Reporte",
      "Admin",
      "Calle 123",
      "U 1"
    )

    expect(report.rows).toHaveLength(1)
    expect(report.rows[0].date).toBe("01/26")
    expect(report.rows[0].capital).toBe("$1.000,00")
    expect(report.rows[0].coeficiente).toBe("1,050")
    expect(report.rows[0].interes).toBe("$50,00")
    expect(report.rows[0].final).toBe("$1.050,00")
  })

  it("applies global multiplier", () => {
    const report = fromTabla(
      [{ date: "01/26", capital: 1000 }],
      csvMatrix,
      2,
      "Reporte"
    )

    // coefConMult = (1.050 - 1) * 2 + 1 = 1.100
    // interes = 1000 * 0.100 = 100
    expect(report.rows[0].interes).toBe("$100,00")
    expect(report.rows[0].final).toBe("$1.100,00")
  })

  it("marks missing table data as error", () => {
    const report = fromTabla(
      [{ date: "04/26", capital: 1000 }],
      csvMatrix,
      1,
      "Reporte"
    )

    expect(report.errors[0]).toBe("ERROR DE FECHA")
    expect(report.rows[0].coeficiente).toBe("")
  })

  it("includes totals row", () => {
    const report = fromTabla(
      [
        { date: "01/26", capital: 1000 },
        { date: "02/26", capital: 2000 }
      ],
      csvMatrix,
      1,
      "Reporte"
    )

    expect(report.totals).not.toBeNull()
    expect(report.totals?.[0]).toBe("TOTAL")
    expect(report.totals?.[1]).toBe("$3.000,00")
  })

  it("returns null totals when no rows", () => {
    const report = fromTabla([], csvMatrix, 1, "Reporte")
    expect(report.totals).toBeNull()
  })
})

describe("fromPercent", () => {
  const refDate = new Date(2026, 2, 1) // March 2026

  it("calculates interest with base percent and month diff", () => {
    const report = fromPercent(
      [{ date: "01/26", capital: 1000 }],
      5,
      refDate,
      "Reporte"
    )

    // diff = months from Jan 2026 to Mar 2026 = 2
    // percent = 2 * 5 = 10%
    // interes = 1000 * 0.10 = 100
    expect(report.rows[0].coeficiente).toBe("10.00")
    expect(report.rows[0].interes).toBe("$100,00")
    expect(report.rows[0].final).toBe("$1.100,00")
  })

  it("uses current date when refDate is today (diff = 0)", () => {
    const today = new Date()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const yy = String(today.getFullYear()).slice(-2)
    const report = fromPercent(
      [{ date: `${mm}/${yy}`, capital: 1000 }],
      5,
      today,
      "Reporte"
    )

    // diff = 0, percent = 0, interes = 0
    expect(report.rows[0].interes).toBe("$0,00")
    expect(report.rows[0].final).toBe("$1.000,00")
  })

  it("handles negative month shift", () => {
    const report = fromPercent(
      [{ date: "04/26", capital: 1000 }],
      5,
      refDate,
      "Reporte"
    )

    // diff = months from Apr 2026 to Mar 2026 = -1
    // percent = -1 * 5 = -5%
    // interes = 1000 * -0.05 = -50
    expect(report.rows[0].coeficiente).toBe("-5.00")
    expect(report.rows[0].interes).toBe("$-50,00")
  })

  it("includes totals row", () => {
    const report = fromPercent(
      [
        { date: "01/26", capital: 1000 },
        { date: "02/26", capital: 2000 }
      ],
      5,
      refDate,
      "Reporte"
    )

    expect(report.totals).not.toBeNull()
    expect(report.totals?.[0]).toBe("TOTAL")
    expect(report.totals?.[1]).toBe("$3.000,00")
  })
})
