import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { getTable, listTableKeys, getTablesConfig, saveTablesConfig, addTableToConfig, removeTableFromConfig } from "../lib/storage";
import { refreshAllTables } from "../lib/scraper";
import type { Env, TableConfig } from "../types/index";

const tables = new Hono<{ Bindings: Env }>();

tables.get("/", async (c) => {
  const config = await getTablesConfig(c.env.TABLES_KV);
  return c.json({ tables: config.tables });
});

tables.get("/config", async (c) => {
  const config = await getTablesConfig(c.env.TABLES_KV);
  return c.json(config);
});

tables.post("/config", authMiddleware, async (c) => {
  const body = await c.req.json<{ id: string; name: string; url: string; folder?: string }>();
  const table: TableConfig = {
    id: body.id,
    name: body.name,
    url: body.url,
    folder: body.folder ?? "",
  };
  await addTableToConfig(c.env.TABLES_KV, table);
  const config = await getTablesConfig(c.env.TABLES_KV);
  return c.json(config);
});

tables.delete("/config/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await removeTableFromConfig(c.env.TABLES_KV, id);
  const config = await getTablesConfig(c.env.TABLES_KV);
  return c.json(config);
});

tables.get("/:id", async (c) => {
  const id = c.req.param("id");
  const table = await getTable(c.env.TABLES_KV, id);
  if (!table) {
    return c.json({ error: "Table not found" }, 404);
  }
  return c.json({ table });
});

tables.post("/refresh", authMiddleware, async (c) => {
  const config = await getTablesConfig(c.env.TABLES_KV);
  const { refreshAllTables } = await import("../lib/scraper");
  const result = await refreshAllTables({
    TABLES_KV: c.env.TABLES_KV,
    AGENDAE_USUARIO: c.env.AGENDAE_USUARIO,
    AGENDAE_PASSWORD: c.env.AGENDAE_PASSWORD,
  }, config.tables);
  return c.json(result);
});

export default tables;