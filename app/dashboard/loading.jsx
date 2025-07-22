import { LoaderCircle } from "lucide-react";
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderCircle className="animate-spin size-12 text-primary" />
    </div>
  );
}
