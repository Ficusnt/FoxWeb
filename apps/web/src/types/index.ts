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
  // Step 1: Source selection
  sourceType: "tablas" | "porcentaje" | null;
  // Step workflow
  currentStep: 1 | 2 | 2.5 | 3;
  // Step 2: Data input
  rows: CoefficientRow[];
  // Step 2.5: Percentage or table selection
  selectedTables: string[];
  selectedPercentage: number | null;
  // Step 3: PDF metadata
  adminName: string;
  street: string;
  unit: string;
  // Step 3: PDF output
  pdfBlob: Blob | null;
  pdfUrl: string | null;
  // Actions
  addRow: () => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, field: "fecha" | "capital", value: string | number) => void;
  loadCSV: (rows: CoefficientRow[]) => void;
  clearRows: () => void;
  setSelectedTables: (ids: string[]) => void;
  setSourceType: (type: "tablas" | "porcentaje" | null) => void;
  setSelectedPercentage: (pct: number | null) => void;
  setStep: (step: 1 | 2 | 2.5 | 3) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetToStep1: () => void;
  setFormFields: (fields: Partial<FormState>) => void;
  setPdfBlob: (blob: Blob | null) => void;
  setPdfUrl: (url: string | null) => void;
  generatePDF: () => Promise<void>;
  reset: () => void;
};