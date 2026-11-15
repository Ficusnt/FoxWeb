export type CoefficientRow = {
  fecha: string;
  capital: number;
}

export type CoefficientTable = {
  id: string;
  name: string;
  headings: string[];
  data: CoefficientRow[];
  updatedAt: string;
}

export type TableConfig = {
  id: string;
  name: string;
  url: string;
  folder: string;
}

export type PDFParams = {
  tableId: string;
  tableName: string;
  admin: string;
  edificio: string;
  unidad: string;
  mode: 'tablas' | 'porcentaje';
  rows: CoefficientRow[];
}

export type FormState = {
  // Step 1: Source selection
  sourceType: 'tablas' | 'porcentaje' | null;
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
  uploadedPdfFileName: string | null;
  // Step 3: PDF output
  pdfBlob: Blob | null;
  pdfUrl: string | null;
  // Actions
  addRow: () => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, field: 'fecha' | 'capital', value: string | number) => void;
  loadCSV: (rows: CoefficientRow[]) => void;
  clearRows: () => void;
  setSelectedTables: (tables: string[]) => void;
  setSelectedPercentage: (pct: number | null) => void;
  setSourceType: (type: 'tablas' | 'porcentaje' | null) => void;
  setUploadedPdfFileName: (name: string | null) => void;
  setStep: (step: 1 | 2 | 2.5 | 3) => void;
  nextStep: () => void;
}
