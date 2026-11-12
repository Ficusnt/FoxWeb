import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [credentials, setCredentials] = useState({
    usuario: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials({ ...credentials, [key]: e.target.value });
      setError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.login(credentials);
      if (data.authenticated) {
        navigate("/options");
      } else {
        setError("Credenciales inválidas");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              name="usuario"
              type="text"
              value={credentials.usuario}
              onChange={handleChange("usuario")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fox-blue outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-fox-blue outline-none"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-100">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};