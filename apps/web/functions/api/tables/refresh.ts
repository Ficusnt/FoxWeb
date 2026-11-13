import axios from "axios";
import cheerio from "cheerio";

const TABLES: { id: string; url: string }[] = [
  { id: "BCRA_ACT_SUM", url: "https://www.agendae.com.ar/listado1.aspx?t=42" },
  { id: "BCRA_ACT_CAP", url: "https://www.agendae.com.ar/listado1.aspx?t=43" },
  { id: "BNA_ACT_SUM", url: "https://www.agendae.com.ar/listado1.aspx?t=44" },
  { id: "BNA_ACT_CAP", url: "https://www.agendae.com.ar/listado1.aspx?t=45" },
  { id: "NBSF_ACT_SUM", url: "https://www.agendae.com.ar/listado1.aspx?t=46" },
  { id: "NBSF_ACT_CAP", url: "https://www.agendae.com.ar/listado1.aspx?t=47" },
];

function parseTable(html: string): { headings: string[]; data: { fecha: string; capital: number }[] } {
  const $ = cheerio.load(html);
  const headings: string[] = [];
  const data: { fecha: string; capital: number }[] = [];

  // Find the grid/table - agendae renders coefficients in an HTML table
  $("table tr").each((i, el) => {
    const cells = $(el).find("td, th");
    if (i === 0) {
      cells.each((_, cell) => {
        headings.push($(cell).text().trim());
      });
    } else {
      const row: { fecha: string; capital: number } = { fecha: "", capital: 0 };
      cells.each((j, cell) => {
        const text = $(cell).text().trim();
        if (j === 0) row.fecha = text;
        if (j === 1) {
          row.capital = parseFloat(text.replace(/,/g, ".")) || 0;
        }
      });
      if (row.fecha) data.push(row);
    }
  });

  return { headings, data };
}

export const onRequestPost: PagesFunction<{ TABLES_KV: KVNamespace; AGENDAE_USUARIO?: string; AGENDAE_PASSWORD?: string }> = async ({ env }) => {
  const results: { updated: number; errors: { tableId: string; error: string }[] } = {
    updated: 0,
    errors: [],
  };

  for (const t of TABLES) {
    try {
      // Login first to get session
      await axios.post(
        "https://www.agendae.com.ar/_login.aspx",
        "accion=LOGIN&usuario=" + encodeURIComponent(env.AGENDAE_USUARIO || "") +
        "&password=" + encodeURIComponent(env.AGENDAE_PASSWORD || "") +
        "&entidad=",
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const { data: html } = await axios.get(t.url);
      const { headings, data } = parseTable(html);

      const tableDoc = {
        id: t.id,
        name: t.id,
        headings,
        data,
        updatedAt: new Date().toISOString(),
      };

      await env.TABLES_KV.put(t.id, JSON.stringify(tableDoc));
      results.updated++;
    } catch (err: any) {
      results.errors.push({ tableId: t.id, error: err.message || String(err) });
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};