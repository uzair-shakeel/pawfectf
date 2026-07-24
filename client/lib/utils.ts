import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Normalize a stored phone value for tel: links (react-phone-input-2 stores digits without +). */
export function toTelHref(phoneNumber: string | number | null | undefined): string {
  if (!phoneNumber) return "";
  let cleaned = String(phoneNumber).replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  if (!cleaned.startsWith("+")) cleaned = `+${cleaned}`;
  return `tel:${cleaned}`;
}
