import { HiMiniQuestionMarkCircle } from "react-icons/hi2";

function ToolTip({ children }) {
  return (
    <div className="hs-tooltip inline-block">
      <button type="button" className="hs-tooltip-toggle ms-1">
        <HiMiniQuestionMarkCircle />
      </button>
      <span
        className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible w-40 text-center z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm dark:bg-slate-700"
        role="tooltip"
      >
        {/* If you have given permission, this information will be displayed
        publicly. */}
        {children}
      </span>
    </div>
  );
}

export default ToolTip;
