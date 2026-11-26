export type TableEntry = {
  name: string
  url: string
}

export type ScraperConfig = {
  retencion: number
  tables: TableEntry[]
}

export type CoefficientMatrix = Record<string, Record<number, number>>

export type InputRow = {
  date: string   // MM/YY
  capital: number
}

export type CalcRow = {
  date: string
  capital: string        // formatted money
  coeficiente: string    // "1,234"
  coef_con_mult: string  // "1,234"
  interes: string        // formatted money
  final: string          // formatted money
}

export type PdfReport = {
  title: string
  meta: string[]
  headers: string[]
  rows: CalcRow[]
  totals: string[] | null
  align: ("l" | "r" | "c")[]
  errors: Record<number, string>
}