import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function decimals(num: number, places: number) {
  const factor = 10 ** places;
  return Math.round(num * factor) / factor;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
