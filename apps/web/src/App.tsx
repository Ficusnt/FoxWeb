import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Step1Page } from "./pages/Step1";
import { Step2Page } from "./pages/Step2";
import { Step25Page } from "./pages/Step25";
import { Step3Page } from "./pages/Step3";

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
            <Route path="/" element={<Step1Page />} />
            <Route path="/step2" element={<Step2Page />} />
            <Route path="/step25" element={<Step25Page />} />
            <Route path="/step3" element={<Step3Page />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}