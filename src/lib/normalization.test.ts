import { describe, it, expect } from "vitest"
import {
  normalizeDate,
  normalizeNumber,
  formatMoney,
  formatCoef,
  monthsDiff,
  sortByMonth,
  normalizarMes,
  extraerYear
} from "./normalization"

describe("normalizeDate", () => {
  it("passes through MM/YY", () => {
    expect(normalizeDate("01/26")).toBe("01/26")
  })

  it("pads single-digit month", () => {
    expect(normalizeDate("1/26")).toBe("01/26")
  })

  it("normalizes month abbreviation", () => {
    expect(normalizeDate("ENE/26")).toBe("01/26")
    expect(normalizeDate("ene/26")).toBe("01/26")
  })

  it("accepts dash separator", () => {
    expect(normalizeDate("01-26")).toBe("01/26")
  })

  it("throws on invalid format", () => {
    expect(() => normalizeDate("2026")).toThrow("Formato de fecha invalido")
    expect(() => normalizeDate("abc")).toThrow("Formato de fecha invalido")
  })

  it("throws on invalid month name", () => {
    expect(() => normalizeDate("ZZZ/26")).toThrow("Mes invalido")
  })
})

describe("normalizeNumber", () => {
  it("parses Argentine format with thousands and decimal", () => {
    expect(normalizeNumber("1.500,50")).toBe(1500.5)
  })

  it("parses comma decimal only", () => {
    expect(normalizeNumber("1500,50")).toBe(1500.5)
  })

  it("parses dot decimal only", () => {
    expect(normalizeNumber("1500.50")).toBe(1500.5)
  })

  it("parses plain integer", () => {
    expect(normalizeNumber("1500")).toBe(1500)
  })

  it("throws on invalid input", () => {
    expect(() => normalizeNumber("")).toThrow("Valor numerico invalido")
    expect(() => normalizeNumber("abc")).toThrow("Valor numerico invalido")
  })
})

describe("formatMoney", () => {
  it("formats as Argentine money", () => {
    expect(formatMoney(1500.5)).toBe("$1.500,50")
    expect(formatMoney(0)).toBe("$0,00")
    expect(formatMoney(1234567.89)).toBe("$1.234.567,89")
  })
})

describe("formatCoef", () => {
  it("formats to 3 decimals with comma", () => {
    expect(formatCoef(1.234)).toBe("1,234")
    expect(formatCoef(1.5)).toBe("1,500")
  })

  it("returns empty string for null/undefined", () => {
    expect(formatCoef(null)).toBe("")
    expect(formatCoef(undefined)).toBe("")
  })
})

describe("monthsDiff", () => {
  it("calculates months difference from reference date", () => {
    const ref = new Date(2026, 2, 1) // March 2026 (month index 2)
    expect(monthsDiff("01/26", ref)).toBe(2)   // Jan 2026 -> Mar 2026 = 2 months
    expect(monthsDiff("03/26", ref)).toBe(0)   // same month
    expect(monthsDiff("12/25", ref)).toBe(3)   // Dec 2025 -> Mar 2026 = 3 months
  })

  it("uses current date when no reference given", () => {
    const d = monthsDiff("01/00")
    expect(d).toBeGreaterThan(300) // more than 25 years from 2000 to now
  })
})

describe("sortByMonth", () => {
  it("sorts rows oldest to newest", () => {
    const rows: [string, number][] = [
      ["03/26", 100],
      ["01/26", 200],
      ["02/26", 150]
    ]
    expect(sortByMonth(rows)).toEqual([
      ["01/26", 200],
      ["02/26", 150],
      ["03/26", 100]
    ])
  })

  it("sorts across years", () => {
    const rows: [string, number][] = [
      ["01/26", 100],
      ["12/25", 200]
    ]
    expect(sortByMonth(rows)).toEqual([
      ["12/25", 200],
      ["01/26", 100]
    ])
  })
})

describe("normalizarMes", () => {
  it("normalizes month abbreviations", () => {
    expect(normalizarMes("ENE.")).toBe("ENE.")
    expect(normalizarMes("ene")).toBe("ENE.")
    expect(normalizarMes("enero")).toBe("ENE.")
    expect(normalizarMes("FEB.")).toBe("FEB.")
    expect(normalizarMes("DIC.")).toBe("DIC.")
  })

  it("returns null for non-month text", () => {
    expect(normalizarMes("XYZ")).toBeNull()
    expect(normalizarMes("")).toBeNull()
  })
})

describe("extraerYear", () => {
  it("extracts valid 4-digit years", () => {
    expect(extraerYear("2026")).toBe(2026)
    expect(extraerYear(2026)).toBe(2026)
    expect(extraerYear("1990")).toBe(1990)
    expect(extraerYear("2100")).toBe(2100)
  })

  it("rejects out-of-range and non-year values", () => {
    expect(extraerYear("1989")).toBeNull()
    expect(extraerYear("2101")).toBeNull()
    expect(extraerYear("26")).toBeNull()
    expect(extraerYear("abc")).toBeNull()
  })
})
