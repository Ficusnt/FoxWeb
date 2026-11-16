import create from 'zustand';
import { persist } from 'zustand/middleware';

export interface FormState {
  currentStep: number;
  rows: any[];
  selectedTables: string[];
  selectedPercentage: number;
  sourceType: string;
  adminName: string;
  street: string;
  unit: string;
  pdfBlob: Blob | null;
  pdfUrl: string | null;
  uploadedPdfFileName: string;
}

export interface FormActions {
  addRow: (row: any) => void;
  removeRow: (index: number) => void;
  updateRow: (index: number, data: any) => void;
  loadCSV: (csvText: string) => void;
  clearRows: () => void;
  setSelectedTables: (tables: string[]) => void;
  setSelectedPercentage: (pct: number) => void;
  setSourceType: (type: string) => void;
  setUploadedPdfFileName: (name: string) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetToStep1: () => void;
  setFormFields: (fields: Partial<FormState>) => void;
  setPdfBlob: (blob: Blob) => void;
  setPdfUrl: (url: string | null) => void;
  generatePDF: () => Promise<void>;
  reset: () => void;
}

const initialState: FormState = {
  currentStep: 1,
  rows: [],
  selectedTables: [],
  selectedPercentage: 0,
  sourceType: '',
  adminName: '',
  street: '',
  unit: '',
  pdfBlob: null,
  pdfUrl: null,
  uploadedPdfFileName: '',
};

const useFormStore = create(
  persist(
    (set) => ({
      ...initialState,
      addRow: (row: any) =>
        set((state: FormState) => ({ rows: [...state.rows, row] })),
      removeRow: (index: number) =>
        set((state: FormState) => {
          const newRows = [...state.rows];
          newRows.splice(index, 1);
          return { rows: newRows };
        }),
      updateRow: (index: number, data: any) =>
        set((state: FormState) => {
          const newRows = [...state.rows];
          newRows[index] = data;
          return { rows: newRows };
        }),
      loadCSV: (csvText: string) => {
        const lines = csvText.trim().split('\n');
        const rows = lines.map((line) => line.split(',').map((cell) => cell.trim()));
        set({ rows });
      },
      clearRows: () => set({ rows: [] }),
      setSelectedTables: (tables: string[]) => set({ selectedTables: tables }),
      setSelectedPercentage: (pct: number) => set({ selectedPercentage: pct }),
      setSourceType: (type: string) => set({ sourceType: type }),
      setUploadedPdfFileName: (name: string) =>
        set({ uploadedPdfFileName: name }),
      setStep: (step: number) => set({ currentStep: step }),
      nextStep: () =>
        set((state: FormState) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state: FormState) => ({ currentStep: state.currentStep - 1 })),
      resetToStep1: () =>
        set({
          currentStep: 1,
          rows: [],
          selectedTables: [],
          selectedPercentage: 0,
          sourceType: '',
          adminName: '',
          street: '',
          unit: '',
          uploadedPdfFileName: '',
        }),
      setFormFields: (fields: Partial<FormState>) =>
        set((state: FormState) => ({ ...state, ...fields })),
      setPdfBlob: (blob: Blob) => set({ pdfBlob: blob }),
      setPdfUrl: (url: string | null) => set({ pdfUrl: url }),
      generatePDF: async () => {
        const state = useFormStore.getState() as FormState;
const { adminName, street, unit, selectedTables, selectedPercentage } = state;

        // Validate required fields
        if (!adminName || !street || !unit) {
          throw new Error('Please fill in all required fields (admin name, street, unit)');
        }

        if (selectedTables.length === 0) {
          throw new Error('Please select at least one table');
        }

        // Call the PDF generation function from lib/pdf.ts
        const { generateTablePDF } = await import('../lib/pdf');
        const pdfBytes = await generateTablePDF({
          tableId: selectedTables[0] || '',
          tableName: selectedTables[0] || '',
          admin: state.adminName,
          edificio: state.street,
          unidad: state.unit,
          mode: 'tablas',
          rows: state.rows,
        });

        // Convert Uint8Array to Blob and create URL
        const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        set({ pdfBlob, pdfUrl });
      },
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'form-store',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
      // Reset uploadedPdfFileName on step reset to avoid stale values
      // Exclude pdfBlob and pdfUrl - they're not JSON-serializable (Blob, object URLs)
      partialize: (state: FormState) => ({
        currentStep: state.currentStep,
        rows: state.rows,
        selectedTables: state.selectedTables,
        selectedPercentage: state.selectedPercentage,
        sourceType: state.sourceType,
        adminName: state.adminName,
        street: state.street,
        unit: state.unit,
        // Exclude non-serializable properties
      }),
    }
  )
);

// Named export matching import { useFormStore } from "../hooks/useFormStore"
export { useFormStore as useFormStore };

// Default export for compatibility
export default useFormStore;