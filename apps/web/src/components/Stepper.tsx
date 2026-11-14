import React from "react";

interface StepperProps {
  currentStep: 1 | 2 | 2.5 | 3;
}

const STEP_LABELS: Record<number, string> = {
  1: "1. Fuente",
  2: "2. Datos",
  2.5: "2.5. Selección",
  3: "3. PDF",
};

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps: Array<{ key: number; label: string }> = [
    { key: 1, label: STEP_LABELS[1] },
    { key: 2, label: STEP_LABELS[2] },
    { key: 2.5, label: STEP_LABELS[2.5] },
    { key: 3, label: STEP_LABELS[3] },
  ];

  const activeIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;
          return (
            <div key={String(step.key)} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isActive ? "bg-fox-blue text-white" : isCompleted ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"}`}>
                {index === 2 ? "2½" : step.key}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-0.5 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`} />
              )}
              <span className={`text-center ${isActive || isCompleted ? "font-bold text-fox-blue" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
