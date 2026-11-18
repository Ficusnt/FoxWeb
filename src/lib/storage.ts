import type { CoefficientTable, TableConfig } from "../types/index";

const TABLES_CONFIG_KEY = "TABLES_CONFIG";
const DEFAULT_RETENTION = 12;
const PDF_STORAGE_KEY_PREFIX = "pdf-";

export async function getTablesConfig(kv: KVNamespace): Promise<{ tables: TableConfig[]; retention: number }> {
  const raw = await kv.get(TABLES_CONFIG_KEY, "json");
  if (!raw) return { tables: [], retention: DEFAULT_RETENTION };
  return raw as unknown as { tables: TableConfig[]; retention: number };
}

export async function saveTablesConfig(kv: KVNamespace, config: { tables: TableConfig[]; retention: number }): Promise<void> {
  await kv.put(TABLES_CONFIG_KEY, JSON.stringify(config));
}

export async function addTableToConfig(kv: KVNamespace, table: TableConfig): Promise<void> {
  const config = await getTablesConfig(kv);
  const exists = config.tables.find((t) => t.id === table.id);
  if (exists) return;
  config.tables.push(table);
  await saveTablesConfig(kv, config);
}

export async function removeTableFromConfig(kv: KVNamespace, id: string): Promise<void> {
  const config = await getTablesConfig(kv);
  config.tables = config.tables.filter((t) => t.id !== id);
  await saveTablesConfig(kv, config);
}

export async function saveTable(kv: KVNamespace, table: CoefficientTable): Promise<void> {
  await kv.put(table.id, JSON.stringify(table));
  await kv.put(`${table.id}_${table.updatedAt}`, JSON.stringify(table));
}

export async function getTable(kv: KVNamespace, id: string): Promise<CoefficientTable | null> {
  const raw = await kv.get(id, "json");
  if (!raw) return null;
  return raw as unknown as CoefficientTable;
}

export async function listTableKeys(kv: KVNamespace, prefix?: string): Promise<string[]> {
  const keys = await kv.list({ prefix });
  return keys.keys.map((k) => k.name);
}

export async function deleteKey(kv: KVNamespace, key: string): Promise<void> {
  await kv.delete(key);
}

/**
 * PDF storage functions
 */

/**
 * Save PDF content to storage
 * @param tableId The table ID associated with the PDF
 * @param pdfContent The PDF file content as ArrayBuffer
 * @param fileName The original filename for download reference
 */
export async function savePdf(kv: KVNamespace, tableId: string, pdfContent: ArrayBuffer, fileName: string): Promise<void> {
  const key = `${PDF_STORAGE_KEY_PREFIX}${tableId}`;
  await kv.put(key, pdfContent);
  await kv.put(`${key}_filename`, fileName);
}

/**
 * Get PDF content by table ID
 * @param tableId The table ID associated with the PDF
 * @returns The PDF file content as ArrayBuffer or null if not found
 */
export async function getPdf(kv: KVNamespace, tableId: string): Promise<ArrayBuffer | null> {
  const key = `${PDF_STORAGE_KEY_PREFIX}${tableId}`;
  // Use get with string type first, then convert
  const pdfContent = await kv.get(key, "text");
  if (!pdfContent) return null;
  // Convert text to ArrayBuffer
  const buf = new ArrayBuffer(pdfContent.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < pdfContent.length; i++) {
    view[i] = pdfContent.charCodeAt(i);
  }
  return buf;
}

/**
 * Get PDF filename by table ID
 * @param tableId The table ID associated with the PDF
 * @returns The filename or null if not found
 */
export async function getPdfFilename(kv: KVNamespace, tableId: string): Promise<string | null> {
  const key = `${PDF_STORAGE_KEY_PREFIX}${tableId}`;
  const fileName = await kv.get(`${key}_filename`, "text");
  return fileName ? fileName : null;
}
