/**
 * storage.ts — Persistence layer for input rows (crash recovery).
 *
 * Tries D1 first (server-side), falls back to localStorage on the client.
 * Replaces input.txt from FoxReloaded.
 */

import type { InputRow } from "../types"

const LOCAL_STORAGE_KEY = "fox_input_rows"

/**
 * Server-side: save input rows to D1.
 */
export async function saveInputRowsToD1(
  db: D1Database,
  rows: InputRow[]
): Promise<void> {
  // Clear existing
  await db.prepare("DELETE FROM input_rows").run()

  if (rows.length === 0) return

  const stmt = db.prepare("INSERT INTO input_rows (date, capital) VALUES (?, ?)")
  for (const row of rows) {
    await stmt.bind(row.date, row.capital).run()
  }
}

/**
 * Server-side: load input rows from D1.
 */
export async function loadInputRowsFromD1(
  db: D1Database
): Promise<InputRow[]> {
  const result = await db.prepare("SELECT date, capital FROM input_rows ORDER BY date").all()
  return (result.results as Array<{ date: string; capital: number }>).map(r => ({
    date: r.date,
    capital: r.capital
  }))
}

/**
 * Client-side: save input rows to localStorage.
 */
export function saveInputRowsToLocal(rows: InputRow[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rows))
  } catch {
    // localStorage may be disabled; silently ignore
  }
}

/**
 * Client-side: load input rows from localStorage.
 */
export function loadInputRowsFromLocal(): InputRow[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

/**
 * D1 schema setup SQL (run once via wrangler d1 execute).
 */
export const D1_SCHEMA = `
CREATE TABLE IF NOT EXISTS input_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  capital REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`
