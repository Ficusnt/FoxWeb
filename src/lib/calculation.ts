import type { CoefficientRow, CoefficientTable, CalculationResult } from "../types/index";

export function parseRow(row: string[], rowIndex: number, globalMult: number): CoefficientRow {
  // Parse date (MM/YY)
  const dateStr = row[0].trim();
  if (!dateStr || !/^\d{2}\/\d{2}$/.test(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  // Parse capital value
  const capitalStr = row[1].trim();
  if (!capitalStr) {
    throw new Error(`Empty capital value in row ${rowIndex}`);
  }

  // Handle different decimal separators
  let capital: number;
  if (capitalStr.includes(',')) {
    capital = parseFloat(capitalStr.replace(',', '.'));
  } else {
    capital = parseFloat(capitalStr);
  }

  if (isNaN(capital)) {
    throw new Error(`Invalid capital value: ${capitalStr}`);
  }

  return {
    fecha: dateStr,
    capital: capital
  };
}

export function from_tabla(csvContent: string, globalMult: number, tableName: string = "unnamed"): CoefficientTable {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error("CSV must have at least 2 rows (header + data)");
  }

  // Skip header row
  const dataLines = lines.slice(1);

  const rows: CoefficientRow[] = [];
  dataLines.forEach((line, index) => {
    const row = line.split(',');
    try {
      rows.push(parseRow(row, index + 1, globalMult));
    } catch (error) {
      console.warn(`Error parsing row ${index + 1}: ${(error as Error).message}`);
      // Skip invalid rows but continue
    }
  });

  // Calculate global multiplier effect
  const totalCapital = rows.reduce((sum, row) => sum + row.capital, 0);

  return {
    id: tableName,
    name: tableName,
    headings: ['Date', 'Capital'],
    data: rows,
    updatedAt: new Date().toISOString()
  };
}

export function calculateGlobalMult(rows: CoefficientRow[]): CalculationResult {
  const totalCapital = rows.reduce((sum, row) => sum + row.capital, 0);
  return {
    globalMult: 1,
    rows,
    totalCapital
  };
}