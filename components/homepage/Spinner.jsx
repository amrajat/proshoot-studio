import { AiOutlineLoading3Quarters } from "react-icons/ai";

function Spinner() {
  return (
    <div
      className="animate-spin inline-block"
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
      <AiOutlineLoading3Quarters />
    </div>
  );
}

export default Spinner;
