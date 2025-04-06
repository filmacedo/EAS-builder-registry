import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(
  text: string | null | undefined,
  maxLength: number = 50
): string {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
