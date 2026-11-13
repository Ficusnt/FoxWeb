import type { CoefficientRow } from "../types/index";

/**
 * Normalize a number string that may use European format (comma as decimal,
 * dot as thousands separator). Returns 0 on parse failure.
 */
export function normalizeNumber(s: string): number {
  if (s == null || s === "") return 0;

  const trimmed = s.trim();
  if (trimmed === "") return 0;

  // European format: "1.234,56" -> "1234.56"
  // Remove thousands dots, replace comma decimal with dot
  const noThousands = trimmed.replace(/\./g, "");
  const normalized = noThousands.replace(/,/g, ".");

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Normalize a date string into MM/YY format.
 * Handles formats like "11/26", "11-26", "nov/26", etc.
 */
export function normalizeDate(s: string): string {
  if (s == null || s === "") return "";

  const trimmed = s.trim();
  if (trimmed === "") return "";

  // Already MM/YY
  const mmyy = trimmed.match(/^(\d{1,2})[\/\-](\d{2})$/);
  if (mmyy) {
    const month = mmyy[1].padStart(2, "0");
    const year = mmyy[2];
    return `${month}/${year}`;
  }

  // Spanish month abbreviations
  const monthMap: Record<string, string> = {
    ene: "01", feb: "02", mar: "03", abr: "04",
    may: "05", jun: "06", jul: "07", ago: "08",
    sep: "09", oct: "10", nov: "11", dic: "12",
  };

  const spanishMatch = trimmed.match(/^([a-z]{3})[\/\-](\d{2})$/i);
  if (spanishMatch) {
    const monthKey = spanishMatch[1].toLowerCase();
    const month = monthMap[monthKey];
    if (month) return `${month}/${spanishMatch[2]}`;
  }

  return trimmed;
}

/**
 * Sort coefficient rows by month (MM/YY), earliest first.
 */
export function sortByMonth(rows: CoefficientRow[]): CoefficientRow[] {
  return [...rows].sort((a, b) => {
    const [aMonth, aYear] = a.fecha.split("/").map(Number);
    const [bMonth, bYear] = b.fecha.split("/").map(Number);
    if (aYear !== bYear) return aYear - bYear;
    return aMonth - bMonth;
  });
}