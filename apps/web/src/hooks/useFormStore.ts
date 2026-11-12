import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FormState, CoefficientRow } from "../types/index";
import { generateTablePDF } from "../lib/pdf";

const initialRows: CoefficientRow[] = [{ fecha: "", capital: 0 }];

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      rows: initialRows,
      selectedTableId: null,
      admin: "",
      edificio: "",
      unidad: "",
      mode: "tabla",
      pdfBlob: null,
      pdfUrl: null,

      setRows: (rows: CoefficientRow[]) => set({ rows }),

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

      setSelectedTable: (id: string | null) => set({ selectedTableId: id }),

      setFormFields: (fields: Partial<FormState>) => set(fields),

      generatePDF: async () => {
        const state = useFormStore.getState();
        if (!state.selectedTableId || !state.admin || !state.edificio || !state.unidad) return;

        const params = {
          tableId: state.selectedTableId,
          tableName: state.selectedTableId,
          admin: state.admin,
          edificio: state.edificio,
          unidad: state.unidad,
          mode: state.mode,
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

      setPdfBlob: (blob: Blob | null) => set({ pdfBlob: blob }),

      setPdfUrl: (url: string | null) => set({ pdfUrl: url }),

      reset: () =>
        set({
          rows: initialRows,
          selectedTableId: null,
          admin: "",
          edificio: "",
          unidad: "",
          mode: "tabla",
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