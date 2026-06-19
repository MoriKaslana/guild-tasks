import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function shouldShowTutorial(key: string): boolean {
  const stored = localStorage.getItem(key);
  if (!stored) return true;
  return Date.now() - Number(stored) > THIRTY_DAYS_MS;
}

export function markTutorialSeen(key: string): void {
  localStorage.setItem(key, String(Date.now()));
}
