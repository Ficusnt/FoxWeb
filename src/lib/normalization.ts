export function normalizeCapital(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function applyGlobalMult(value: number, globalMult: number): number {
  return value * globalMult;
}
