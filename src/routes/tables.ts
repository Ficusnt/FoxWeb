import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { getTable, listTableKeys } from "../lib/storage";
import { TABLES } from "../data/tables";
import type { Env } from "../types/index";

const tables = new Hono<{ Bindings: Env }>();

tables.use("*", authMiddleware);

tables.get("/", async (c) => {
  return c.json({ tables: TABLES });
});

tables.get("/:id", async (c) => {
  const id = c.req.param("id");
  const table = await getTable(c.env.TABLES_KV, id);
  if (!table) {
    return c.json({ error: "Table not found" }, 404);
  }
  return c.json({ table });
});

tables.post("/refresh", async (c) => {
  const { refreshAllTables } = await import("../lib/scraper");
  const result = await refreshAllTables({
    TABLES_KV: c.env.TABLES_KV,
    AGENDAE_USUARIO: c.env.AGENDAE_USUARIO,
    AGENDAE_PASSWORD: c.env.AGENDAE_PASSWORD,
  });
  return c.json(result);
});

export default tables;