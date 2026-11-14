import axios, { AxiosInstance } from "axios";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "/api";

export function useApi() {
  const client: AxiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    getTables: () => client.get("/tables").then((r) => r.data),
    getTable: (id: string) => client.get(`/tables/${id}`).then((r) => r.data),
    getTableConfig: () => client.get("/tables/config").then((r) => r.data),
    addTableToConfig: (table: { id: string; name: string; url: string; folder?: string }) =>
      client.post("/tables/config", table).then((r) => r.data),
    removeTableFromConfig: (id: string) =>
      client.delete(`/tables/config/${id}`).then((r) => r.data),
    refreshTables: () =>
      client.post("/tables/refresh").then((r) => r.data),
    login: (creds: { usuario: string; password: string }) =>
      client.post("/auth/login", creds).then((r) => r.data),
    logout: () => client.post("/auth/logout").then((r) => r.data),
    checkAuth: () => client.get("/auth/me").then((r) => r.data),
    getTableForPdf: (tableId: string) =>
      client.post("/pdf/generate", { tableId }).then((r) => r.data),
  };
}

export type Api = ReturnType<typeof useApi>;