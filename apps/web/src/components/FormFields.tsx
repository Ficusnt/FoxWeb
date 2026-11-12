import React from "react";

interface FormFieldsProps {
  admin: string;
  edificio: string;
  unidad: string;
  mode: "tabla" | "porcentaje";
  onChange: (field: keyof FormFieldsProps) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormFields: React.FC<FormFieldsProps> = ({
  admin,
  edificio,
  unidad,
  mode,
  onChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Documento</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
          <input
            type="text"
            value={admin}
            onChange={onChange("admin")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fox-blue"
            placeholder="Nombre del administrador"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edificio</label>
          <input
            type="text"
            value={edificio}
            onChange={onChange("edificio")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fox-blue"
            placeholder="Nombre del edificio"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
          <input
            type="text"
            value={unidad}
            onChange={onChange("unidad")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fox-blue"
            placeholder="Número de unidad"
          />
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Tabla</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="tabla"
              checked={mode === "tabla"}
              onChange={() => onChange("mode")({ target: { value: "tabla" } } as any)}
              className="w-4 h-4 text-fox-blue focus:ring-fox-blue"
            />
            <span className="text-sm text-gray-700">Tabla (Capital)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="porcentaje"
              checked={mode === "porcentaje"}
              onChange={() => onChange("mode")({ target: { value: "porcentaje" } } as any)}
              className="w-4 h-4 text-fox-blue focus:ring-fox-blue"
            />
            <span className="text-sm text-gray-700">Porcentaje</span>
          </label>
        </div>
      </div>
    </div>
  );
};