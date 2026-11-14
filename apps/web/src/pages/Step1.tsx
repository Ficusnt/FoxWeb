import React, { useState, useEffect } from "react";
import { useFormStore } from "../hooks/useFormStore";
import { useApi } from "../hooks/useApi";
import { Stepper } from "../components/Stepper";
import { useNavigate } from "react-router-dom";
import type { TableConfig } from "../types/index";

export const Step1Page: React.FC = () => {
  const navigate = useNavigate();
  const { setSourceType, setStep, currentStep } = useFormStore();
  const api = useApi();
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});

  const [selectedSource, setSelectedSource] = useState<"tablas" | "porcentaje" | null>(null);
  const [newTableName, setNewTableName] = useState("");
  const [newTableUrl, setNewTableUrl] = useState("");

  useEffect(() => {
    api.getTableConfig().then(({ tables }) => {
      setTables(tables ?? []);
    }).catch(() => {
      setTables([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const loadTables = () => {
    api.getTableConfig().then(({ tables }) => {
      setTables(tables ?? []);
    }).catch(() => {
      setTables([]);
    });
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim() || !newTableUrl.trim()) return;
    const id = newTableName.toLowerCase().replace(/\s+/g, "-");
    try {
      await api.addTableToConfig({ id, name: newTableName, url: newTableUrl });
      setNewTableName("");
      setNewTableUrl("");
      loadTables();
    } catch (err) {
      alert("No se pudo agregar la tabla");
    }
  };

  const handleRemoveTable = async (id: string) => {
    if (!window.confirm("¿Eliminar esta tabla?")) return;
    try {
      await api.removeTableFromConfig(id);
      loadTables();
    } catch (err) {
      alert("No se pudo eliminar la tabla");
    }
  };

  const handleRefreshTables = async () => {
    setRefreshing(Object.fromEntries(tables.map((t) => [t.id, "loading"])));
    try {
      await api.refreshTables();
      setRefreshing(Object.fromEntries(tables.map((t) => [t.id, "success"])));
      loadTables();
    } catch (err) {
      setRefreshing(Object.fromEntries(tables.map((t) => [t.id, "error"])));
      alert("Error al refrescar tablas");
    }
  };

  const handleContinue = () => {
    if (!selectedSource) return;
    if (selectedSource === "tablas" && tables.length === 0) return;
    setSourceType(selectedSource);
    setStep(2);
    navigate("/step2");
  };

  const isRevision = currentStep === 1 && tables.length > 0 && !selectedSource;

  return (
    <div className="space-y-6">
      <Stepper currentStep={1} />
      <div className="max-w-2xl mx-auto">
        {isRevision ? (
          <RevisionView
            tables={tables}
            onRemove={handleRemoveTable}
            refreshing={refreshing}
            onRefresh={handleRefreshTables}
          />
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Paso 1: Seleccionar Fuente</h2>
            <p className="text-gray-600 mb-6">
              Elige qué tipo de tabla quieres generar:
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setSelectedSource("tablas")}
                disabled={tables.length === 0}
                className={`w-full py-3 rounded-lg border text-left font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedSource === "tablas" ? "bg-fox-blue text-white border-fox-blue" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              >
                TABLAS {tables.length === 0 && "(no tablas configuradas)"}
              </button>
              <button
                onClick={() => setSelectedSource("porcentaje")}
                className={`w-full py-3 rounded-lg border text-left font-medium transition-colors ${selectedSource === "porcentaje" ? "bg-fox-blue text-white border-fox-blue" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              >
                PORCENTAJE
              </button>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                disabled={!selectedSource || loading || (selectedSource === "tablas" && tables.length === 0)}
                onClick={handleContinue}
                className={
                  !selectedSource
                    ? "px-6 py-2 bg-gray-400 text-white rounded-lg disabled:cursor-not-allowed"
                    : "px-6 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark transition-colors text-sm font-medium"
                }
              >
                Siguiente: Datos
              </button>
            </div>

            <details className="mt-6 border border-gray-200 rounded-lg">
              <summary className="cursor-pointer py-2 px-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg list-none font-medium">
                + Agregar tabla
              </summary>
              <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Agregar nueva tabla</h3>
                <form onSubmit={handleAddTable} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nombre de la tabla"
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fox-blue focus:outline-none"
                    />
                    <input
                      type="url"
                      placeholder="URL de Agendae"
                      value={newTableUrl}
                      onChange={(e) => setNewTableUrl(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fox-blue focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newTableName.trim() || !newTableUrl.trim()}
                    className="w-full py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Agregar Tabla
                  </button>
                </form>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

function RevisionView({
  tables,
  onRemove,
  refreshing,
  onRefresh,
}: {
  tables: TableConfig[];
  onRemove: (id: string) => void;
  refreshing: Record<string, "idle" | "loading" | "success" | "error">;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Revisión de Tablas</h2>
          <p className="text-gray-600 text-sm">
            Tablas configuradas disponibles para revisar y re-scrapear:
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={Object.values(refreshing).some((s) => s === "loading")}
          className="px-4 py-2 bg-fox-blue text-white rounded-lg hover:bg-fox-dark transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {Object.values(refreshing).some((s) => s === "loading") ? "Actualizando..." : "Actualizar Todas"}
        </button>
      </div>
      {tables.length === 0 ? (
        <p className="text-gray-500">No hay tablas configuradas.</p>
      ) : (
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600">ID</th>
              <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600">URL</th>
              <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600 text-center">Estado</th>
              <th className="px-4 py-2 border-b border-gray-200 font-medium text-gray-600 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((t) => {
              const status = refreshing[t.id] ?? "idle";
              return (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-sm text-gray-700">{t.id}</td>
                  <td className="px-4 py-2 text-gray-700">{t.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500 break-all max-w-xs">{t.url}</td>
                  <td className="px-4 py-2 text-center">
                    {status === "loading" ? (
                      <span className="text-xs text-gray-500 animate-pulse">Actualizando...</span>
                    ) : status === "success" ? (
                      <span className="text-xs text-green-600">✓ Listo</span>
                    ) : status === "error" ? (
                      <span className="text-xs text-red-600">✗ Error</span>
                    ) : (
                      <span className="text-xs text-gray-400">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => onRemove(t.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={refreshing[t.id] === "loading"}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
