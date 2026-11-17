import type { CoefficientRow, CoefficientTable, CalculationResult } from "../types/index";

/**
 * Parse a CSV row into CoefficientRow
 * @param row The CSV row as string array
 * @param rowIndex The row index for the date
 * @param globalMult The global multiplier
 * @returns CoefficientRow with parsed values
 */
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

/**
 * Parse table data from CSV content
 * @param csvContent CSV content as string
 * @param globalMult The global multiplier
 * @returns CoefficientTable with parsed data
 */
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
    if (row.length >= 2) {
      try {
        rows.push(parseRow(row, index + 1, globalMult));
      } catch (error) {
        console.warn(`Error parsing row ${index + 1}: ${error.message}`);
        // Skip invalid rows but continue
      }
    }
  });
  
  // Calculate total capital
  const totalCapital = rows.reduce((sum, row) => sum + row.capital, 0);
  
  return {
    id: `${tableName}-${Date.now()}`,
    name: tableName,
    headings: [], // This would be populated from actual headers if needed
    data: rows,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Parse percentage-based data
 * @param csvContent CSV content as string
 * @param globalMult The global multiplier
 * @returns CoefficientTable with parsed data
 */
export function from_percent(csvContent: string, globalMult: number, tableName: string = "unnamed"): CoefficientTable {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error("CSV must have at least 2 rows (header + data)");
  }
  
  // Skip header row
  const dataLines = lines.slice(1);
  
  const rows: CoefficientRow[] = [];
  dataLines.forEach((line, index) => {
    const row = line.split(',');
    if (row.length >= 2) {
      try {
        // For percentage mode, the first column might be a percentage value
        // We'll treat it as the capital value, and assume the second column is additional data
        const capitalStr = row[0].trim();
        const capital = parseFloat(capitalStr);
        
        if (!isNaN(capital)) {
          rows.push({
            fecha: `row-${index + 1}`,
            capital: capital * globalMult
          });
        }
      } catch (error) {
        console.warn(`Error parsing row ${index + 1}: ${error.message}`);
        // Skip invalid rows but continue
      }
    }
  });
  
  // Calculate total capital
  const totalCapital = rows.reduce((sum, row) => sum + row.capital, 0);
  
  return {
    id: `${tableName}-${Date.now()}`,
    name: tableName,
    headings: [], // This would be populated from actual headers if needed
    data: rows,
    updatedAt: new Date().toISOString()
  };
}