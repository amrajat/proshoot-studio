import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Assume localhost for development if no VERCEL_URL is set.
  // Make sure to set the NEXT_PUBLIC_APP_URL for production domains.
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};
