import { LuFrown } from "react-icons/lu";

function Error({ message }) {
  return (
    <div className="bg-red-50 border-s-4 border-red-500 p-4 " role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Icon */}
          <span className="inline-flex justify-center items-center size-8 rounded border-4 border-red-100 bg-red-200 text-red-800   ">
            <LuFrown className="flex-shrink-0 size-4" />
          </span>
          {/* End Icon */}
        </div>
        <div className="ms-3">
          <h3 className="text-gray-800 font-semibold ">Oops!</h3>
          <p className="text-sm text-gray-700 ">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Error;
