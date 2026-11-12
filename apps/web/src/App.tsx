import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataInputPage } from "./pages/DataInput";
import { OptionsPage } from "./pages/Options";
import { PDFPage } from "./pages/PDFPage";
import { LoginPage } from "./pages/Login";
import { useApi } from "./hooks/useApi";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, authenticated }: { children: React.ReactNode; authenticated: boolean }) => {
  return authenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  const api = useApi();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    api.checkAuth().then(({ authenticated: auth }) => {
      setAuthenticated(auth);
      setChecking(false);
    });
  }, [api]);

  if (checking) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-fox-gray flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fox-blue"></div>
        </div>
      </BrowserRouter>
    );
  }

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
            <Route path="/" element={<Navigate to={authenticated ? "/options" : "/login"} replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/data" element={<ProtectedRoute authenticated={authenticated}><DataInputPage /></ProtectedRoute>} />
            <Route path="/options" element={<ProtectedRoute authenticated={authenticated}><OptionsPage /></ProtectedRoute>} />
            <Route path="/pdf" element={<ProtectedRoute authenticated={authenticated}><PDFPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}