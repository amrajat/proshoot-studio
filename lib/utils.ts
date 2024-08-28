import { Figtree } from "next/font/google";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export async function streamToString(
  stream: ReadableStream<Uint8Array>
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let result = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    result += decoder.decode(value);
  }

  reader.releaseLock();
  return result;
}

export const figtree = Figtree({ subsets: ["latin"], display: "swap" });

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
