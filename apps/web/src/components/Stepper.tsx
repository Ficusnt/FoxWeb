import React from "react";

interface StepperProps {
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const steps = ["Datos", "Opciones", "PDF"];

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isActive
                  ? "bg-fox-blue text-white"
                  : isCompleted
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500"
              }`}>
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-full h-0.5 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`} />
              )}
              <span className={`text-center ${
                isActive || isCompleted ? "font-bold text-fox-blue" : "text-gray-400"
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};