import type { CoefficientTable } from "../types/index";

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