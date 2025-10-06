import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function roundTo(n: number, precision: number): number {
  const scale = Math.pow(10, precision);
  return Math.round(n * scale) / scale;
}

export function toPercent(n: number, precision: number = 0): string {
  return `${roundTo(n, 2 + precision) * 100}%`;
}
