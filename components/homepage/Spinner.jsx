import { LoaderCircle } from "lucide-react";

function Spinner() {
  return (
    <div
      className="animate-spin inline-block"
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
      <LoaderCircle />
    </div>
  );
}

export default Spinner;
