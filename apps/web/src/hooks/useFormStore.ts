import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FormState, CoefficientRow } from "../types/index";
import { generateTablePDF } from "../lib/pdf";

const initialRows: CoefficientRow[] = [{ fecha: "", capital: 0 }];

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      // Step 1: Source selection
      sourceType: null,
      // Step workflow
      currentStep: 1,
      // Step 2: Data input
      rows: initialRows,
      selectedTables: [],
      selectedPercentage: null,
      // Step 3: PDF metadata
      adminName: "",
      street: "",
      unit: "",
      // Step 3: PDF output
      pdfBlob: null,
      pdfUrl: null,

      addRow: () =>
        set((state) => ({
          rows: [...state.rows, { fecha: "", capital: 0 }],
        })),

      removeRow: (index: number) =>
        set((state) => ({
          rows: state.rows.filter((_, i) => i !== index),
        })),

      updateRow: (index: number, field: "fecha" | "capital", value: string | number) =>
        set((state) => {
          const newRows = [...state.rows];
          if (field === "capital") {
            newRows[index] = { ...newRows[index], capital: Number(value) };
          } else {
            newRows[index] = { ...newRows[index], fecha: String(value) };
          }
          return { rows: newRows };
        }),

      loadCSV: (rows: CoefficientRow[]) => set({ rows }),

      clearRows: () => set({ rows: [] }),

      setSelectedTables: (tables: string[]) => set({ selectedTables: tables }),

      setSelectedPercentage: (pct: number | null) =>
        set({ selectedPercentage: pct }),

      setUploadedPdfFileName: (name: string | null) =>
        set({ uploadedPdfFileName: name }),

      setSelectedTables: (ids: string[]) => set({ selectedTables: ids }),

      setSourceType: (type: "tablas" | "porcentaje" | null) =>
        set({ sourceType: type }),

      setSelectedPercentage: (pct: number | null) =>
        set({ selectedPercentage: pct }),

      setStep: (step: 1 | 2 | 2.5 | 3) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => {
          const order: Array<1 | 2 | 2.5 | 3> = [1, 2, 2.5, 3];
          const idx = order.indexOf(state.currentStep);
          const next = order[Math.min(idx + 1, order.length - 1)];
          return { currentStep: next };
        }),

      prevStep: () =>
        set((state) => {
          const order: Array<1 | 2 | 2.5 | 3> = [1, 2, 2.5, 3];
          const idx = order.indexOf(state.currentStep);
          const prev = order[Math.max(idx - 1, 0)];
          return { currentStep: prev };
        }),

      resetToStep1: () =>
        set({
          currentStep: 1,
          sourceType: null,
          selectedTables: [],
          selectedPercentage: null,
          adminName: "",
          street: "",
          unit: "",
          pdfBlob: null,
          pdfUrl: null,
        }),

      setFormFields: (fields: Partial<FormState>) => set(fields),

      setPdfBlob: (blob: Blob | null) => set({ pdfBlob: blob }),

      setPdfUrl: (url: string | null) => set({ pdfUrl: url }),

      generatePDF: async () => {
        const state = useFormStore.getState();
        if (!state.selectedTables.length && !state.selectedPercentage) return;
        if (!state.adminName || !state.street || !state.unit) return;

        const params = {
          tableId: state.selectedTables[0] ?? "",
          tableName: state.selectedTables[0] ?? "",
          admin: state.adminName,
          edificio: state.street,
          unidad: state.unit,
          mode: state.sourceType === "tablas" ? ("tabla" as const) : ("porcentaje" as const),
          rows: state.rows,
        };

        try {
          const pdfBytes = await generateTablePDF(params);
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          set({ pdfBlob: blob, pdfUrl: url });
        } catch (err) {
          console.error("PDF generation failed:", err);
          throw err;
        }
      },

      reset: () =>
        set({
          currentStep: 1,
          sourceType: null,
          rows: initialRows,
          selectedTables: [],
          selectedPercentage: null,
          adminName: "",
          street: "",
          unit: "",
          pdfBlob: null,
          pdfUrl: null,
        }),
    }),
    {
      name: "foxweb-form-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);