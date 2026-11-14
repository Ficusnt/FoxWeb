import axios, { AxiosInstance } from "axios";
import type { CoefficientRow, CoefficientTable, TableConfig } from "../types/index";
import { normalizeDate, normalizeNumber } from "./csv";

const LOGIN_ENDPOINT = "_login.aspx";
const TABLE_ENDPOINT = "_back.aspx";

/**
 * Create an axios session configured like the Python requests.Session.
 */
export function createSession(): AxiosInstance {
  return axios.create({
    baseURL: "https://www.agendae.com.ar/",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "FoxWeb/1.0",
    },
    withCredentials: true,
  });
}

/**
 * Login to agendae.com.ar via the AJAX endpoint.
 * Returns true on success, throws on failure.
 */
export async function login(session: AxiosInstance, usuario: string, password: string, entidad: string = ""): Promise<void> {
  const params = new URLSearchParams();
  params.append("accion", "LOGIN");
  params.append("usuario", usuario);
  params.append("password", password);
  params.append("entidad", entidad);

  const res = await session.post(LOGIN_ENDPOINT, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": "https://www.agendae.com.ar/",
    },
  });

  const body = typeof res.data === "string" ? res.data : JSON.stringify(res.data);

  if (!body.startsWith("OK")) {
    throw new Error(`Login failed: ${body}`);
  }
}

/**
 * Fetch a coefficient table via the _back.aspx AJAX call.
 * `t` is the table id from the URL query parameter.
 * `referer` is the full URL of the table page (required for session gating).
 */
export async function fetchTable(
  session: AxiosInstance,
  t: number,
  referer: string,
): Promise<{ headings: string[]; data: CoefficientRow[] }> {
  const params = new URLSearchParams();
  params.append("tipoEntidad", "COEFICIENTES");
  params.append("idct", String(t));
  params.append("page", "1");
  params.append("pageLimit", "0");

  const res = await session.post(TABLE_ENDPOINT, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": referer,
    },
  });

  const body = typeof res.data === "object" ? res.data : JSON.parse(res.data);

  const headings: string[] = body.dt?.headings ?? [];
  const rawData: unknown[][] = body.dt?.data ?? [];

  const data: CoefficientRow[] = rawData.map((row: unknown[]) => {
    const fecha = normalizeDate(String(row[0] ?? ""));
    const capital = normalizeNumber(String(row[1] ?? ""));
    return { fecha, capital };
  });

  return { headings, data };
}

/**
 * Refresh all tables: login, fetch each table from agendae, save to KV.
 * Returns { updated, errors } where errors contains per-table failures.
 */
export async function refreshAllTables(
  env: { TABLES_KV: KVNamespace; AGENDAE_USUARIO?: string; AGENDAE_PASSWORD?: string },
  tables: TableConfig[],
): Promise<{ updated: number; errors: Array<{ tableId: string; error: string }> }> {
  const session = createSession();

  try {
    await login(session, env.AGENDAE_USUARIO ?? "", env.AGENDAE_PASSWORD ?? "");
  } catch (err) {
    return {
      updated: 0,
      errors: [{ tableId: "all", error: `Login failed: ${err}` }],
    };
  }

  const errors: Array<{ tableId: string; error: string }> = [];
  let updated = 0;

  for (const table of tables) {
    try {
      const referer = table.url;
      const t = parseInt(table.url.split("t=")[1] ?? "0", 10);

      const { headings, data } = await fetchTable(session, t, referer);

      const tableData: CoefficientTable = {
        id: table.id,
        name: table.name,
        headings,
        data,
        updatedAt: new Date().toISOString(),
      };

      await env.TABLES_KV.put(table.id, JSON.stringify(tableData));
      updated++;
    } catch (err) {
      errors.push({ tableId: table.id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return { updated, errors };
}