
import { create } from 'zustand';
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
  updateRow: (index: number, field?: string, value?: string | number) => void;
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

export type FormStore = FormState & FormActions;

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

export const useFormStore = create<FormStore>()(
  persist<FormStore, [], [], Partial<FormState>>(
    (set, get) => ({
      ...initialState,

      addRow: (row) =>
        set((state) => ({
          rows: [...state.rows, row],
        })),

      removeRow: (index) =>
        set((state) => {
          const newRows = [...state.rows];
          newRows.splice(index, 1);
          return { rows: newRows };
        }),

      updateRow: (index, field, value) =>
        set((state) => {
          const newRows = [...state.rows];

          if (field !== undefined && value !== undefined) {
            newRows[index] = {
              ...newRows[index],
              [field]: value,
            };
          }

          return { rows: newRows };
        }),

      loadCSV: (csvText) => {
        const lines = csvText.trim().split('\n');
        const rows = lines.map((line) =>
          line.split(',').map((cell) => cell.trim())
        );
        set({ rows });
      },

      clearRows: () => set({ rows: [] }),

      setSelectedTables: (tables) =>
        set({ selectedTables: tables }),

      setSelectedPercentage: (pct) =>
        set({ selectedPercentage: pct }),

      setSourceType: (type) =>
        set({ sourceType: type }),

      setUploadedPdfFileName: (name) =>
        set({ uploadedPdfFileName: name }),

      setStep: (step) =>
        set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: state.currentStep + 1,
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: state.currentStep - 1,
        })),

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
          pdfBlob: null,
          pdfUrl: null,
        }),

      setFormFields: (fields) =>
        set((state) => ({
          ...state,
          ...fields,
        })),

      setPdfBlob: (blob) =>
        set({ pdfBlob: blob }),

      setPdfUrl: (url) =>
        set({ pdfUrl: url }),

      generatePDF: async () => {
        const state = get();

        const {
          adminName,
          street,
          unit,
          selectedTables,
        } = state;

        // Validate required fields
        if (!adminName || !street || !unit) {
          throw new Error(
            'Please fill in all required fields (admin name, street, unit)'
          );
        }

        if (selectedTables.length === 0) {
          throw new Error('Please select at least one table');
        }

        // Generate PDF
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

        // Convert Uint8Array to a standard ArrayBuffer
        const buffer = new ArrayBuffer(pdfBytes.byteLength);
        new Uint8Array(buffer).set(pdfBytes);

        const pdfBlob = new Blob([buffer], {
          type: 'application/pdf',
        });

        const pdfUrl = URL.createObjectURL(pdfBlob);

        set({ pdfBlob, pdfUrl });
      },

      reset: () => {
        const currentUrl = get().pdfUrl;

        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        set({ ...initialState });
      },
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

      // Persist only serializable data
      partialize: (state) => ({
        currentStep: state.currentStep,

        rows: state.rows.map((row: any) => ({
          fecha: row?.fecha ?? '',
          capital: row?.capital ?? 0,
        })),

        selectedTables: state.selectedTables,
        selectedPercentage: state.selectedPercentage,
        sourceType: state.sourceType,
        adminName: state.adminName,
        street: state.street,
        unit: state.unit,
        uploadedPdfFileName: state.uploadedPdfFileName,
      }),
    }
  )
);

// Default export for compatibility
export default useFormStore;
