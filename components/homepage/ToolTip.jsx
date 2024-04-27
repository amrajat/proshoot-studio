import { IoHelpCircle } from "react-icons/io5";

function ToolTip({ children }) {
  return (
    <div className="hs-tooltip inline-block align-middle before:content-['\00a0']">
      <button
        type="button"
        className="hs-tooltip-toggle size-4 inline-flex justify-center items-center gap-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[.05] dark:hover:border-white/[.1] dark:hover:text-white"
      >
        <IoHelpCircle className="flex-shrink-0 size-4" />
        <span
          className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded shadow-sm dark:bg-slate-700"
          role="tooltip"
        >
          {children}
        </span>
      </button>
    </div>
  );
}

export default ToolTip;
