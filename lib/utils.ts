import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getBaseUrlFromEnv } from "./env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBaseUrl = getBaseUrlFromEnv;
