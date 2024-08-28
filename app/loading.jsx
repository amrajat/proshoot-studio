"use client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-row gap-2" aria-label="loading">
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>
  );
}
