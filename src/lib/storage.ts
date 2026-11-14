import type { CoefficientTable, TableConfig } from "../types/index";

const TABLES_CONFIG_KEY = "TABLES_CONFIG";
const DEFAULT_RETENTION = 12;

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

export async function pruneOldSnapshots(
  kv: KVNamespace,
  tableId: string,
  keep: number,
): Promise<void> {
  const keys = await kv.list({ prefix: `${tableId}_` });
  const snapshots = keys.keys
    .map((k) => k.name)
    .filter((name) => name.startsWith(`${tableId}_`))
    .sort()
    .reverse();

  // Keep `keep` most recent snapshots
  const toDelete = snapshots.slice(keep);
  for (const key of toDelete) {
    await kv.delete(key);
  }
}