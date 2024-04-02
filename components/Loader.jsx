function Loader() {
  return (
    <div className="flex animate-pulse">
      <div className="ms-4 mt-2 w-full">
        {/* <h3
          className="h-4 bg-gray-200 rounded-full dark:bg-gray-700"
          style={{ width: "40%" }}
        /> */}
        <ul className="mt-5 space-y-3">
          <li className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
          <li className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
          <li className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
          <li className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700" />
        </ul>
      </div>
    </div>
  );
}

export default Loader;
