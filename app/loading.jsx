"use client";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className="animate-spin inline-block"
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
        <AiOutlineLoading3Quarters />
      </div>
      <p className="text-sm text-gray-800 dark:text-neutral-200">
        &nbsp;Loading...
      </p>
    </div>
  );
}
