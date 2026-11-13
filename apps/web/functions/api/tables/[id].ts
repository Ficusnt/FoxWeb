import type { TableConfig } from "../../../src/types/index";

export const onRequestGet: PagesFunction<{ TABLES_KV: KVNamespace }> = async ({ params, env }) => {
  const id = params.id as string;
  const table = await env.TABLES_KV.get(id, "json");

  if (!table) {
    return new Response(JSON.stringify({ error: "Table not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ table }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};