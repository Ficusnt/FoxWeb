import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataInputPage } from "./pages/DataInput";
import { OptionsPage } from "./pages/Options";
import { PDFPage } from "./pages/PDFPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-fox-gray">
        <nav className="bg-fox-blue shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-fox-blue font-bold text-xl">
                F
              </div>
              <span className="text-white font-semibold text-lg">FoxWeb</span>
            </div>
            <div className="text-xs text-fox-light uppercase tracking-wider font-medium">
              Generador de PDF de Coeficientes
            </div>
          </div>
        </nav>

        <main className="py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/options" replace />} />
            <Route path="/data" element={<DataInputPage />} />
            <Route path="/options" element={<OptionsPage />} />
            <Route path="/pdf" element={<PDFPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}