import { LuFrown } from "react-icons/lu";

function Error({ message }) {
  return (
    <div
      className="bg-red-50 border-s-4 border-red-500 p-4 dark:bg-red-800/30"
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Icon */}
          <span className="inline-flex justify-center items-center size-8 rounded-full border-4 border-red-100 bg-red-200 text-red-800 dark:border-red-900 dark:bg-red-800 dark:text-red-400">
            <LuFrown className="flex-shrink-0 size-4" />
          </span>
          {/* End Icon */}
        </div>
        <div className="ms-3">
          <h3 className="text-gray-800 font-semibold dark:text-white">Oops!</h3>
          <p className="text-sm text-gray-700 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Error;
