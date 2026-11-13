import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types/index";

const pdf = new Hono<{ Bindings: Env }>();

pdf.use("*", authMiddleware);

pdf.post("/generate", async (c) => {
  // PDF generation is client-side via pdf-lib.
  // This endpoint is a proxy if we ever need server-side generation.
  // For now, return the table data so the client can generate the PDF.
  const body = await c.req.json();
  const { tableId } = body;

  const { getTable } = await import("../lib/storage");
  const table = await getTable(c.env.TABLES_KV, tableId);

  if (!table) {
    return c.json({ error: "Table not found" }, 404);
  }

  return c.json({ table });
});

export default pdf;