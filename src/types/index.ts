export type TableConfig = {
  id: string;
  name: string;
  url: string;
  folder: string;
};

export type CoefficientRow = {
  fecha: string;   // MM/YY format
  capital: number; // numeric value
};

export type CoefficientTable = {
  id: string;
  name: string;
  headings: string[];
  data: CoefficientRow[];
  updatedAt: string; // ISO timestamp
};

export type PDFParams = {
  tableId: string;
  tableName: string;
  admin: string;
  edificio: string;
  unidad: string;
  mode: "tabla" | "porcentaje";
  rows: CoefficientRow[];
};

export type SessionData = {
  authenticated: boolean;
  loggedInAt: string;
};

export type Env = {
  TABLES_KV: KVNamespace;
  __STATIC_CONTENT: KVNamespace;
  AGENDAE_USUARIO?: string;
  AGENDAE_PASSWORD?: string;
  SESSION_SECRET?: string;
  ENVIRONMENT?: string;
};

export type RefreshResult = {
  updated: number;
  errors: { tableId: string; error: string }[];
};