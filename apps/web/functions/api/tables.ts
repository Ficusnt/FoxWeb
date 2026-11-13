import { TABLES } from "../../src/data/tables";

export const onRequestGet: PagesFunction = async () => {
  return new Response(JSON.stringify({ tables: TABLES }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};