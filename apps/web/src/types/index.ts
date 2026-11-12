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

export type TableConfig = {
  id: string;
  name: string;
  url: string;
  folder: string;
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

export type FormState = {
  // Step 1: Data Input
  rows: CoefficientRow[];
  // Actions
  addRow: () => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, field: "fecha" | "capital", value: string | number) => void;
  loadCSV: (rows: CoefficientRow[]) => void;
  // Step 2: Options
  selectedTableId: string | null;
  admin: string;
  edificio: string;
  unidad: string;
  mode: "tabla" | "porcentaje";
  // Step 3: PDF
  pdfBlob: Blob | null;
  pdfUrl: string | null;
  // PDF actions
  setPdfBlob: (blob: Blob | null) => void;
  setPdfUrl: (url: string | null) => void;
  // Form actions
  setSelectedTable: (id: string | null) => void;
  setFormFields: (fields: Partial<FormState>) => void;
  generatePDF: () => Promise<void>;
  reset: () => void;
};