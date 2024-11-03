function Loader({ cls = "" }) {
  return (
    <div className={`flex animate-pulse ${cls}`} aria-label="loading">
      <div className="ms-4 mt-2 w-full">
        {/* <h3
          className="h-4 bg-gray-200 rounded "
          style={{ width: "40%" }}
        /> */}
        <div className="flex flex-row gap-2 justify-center">
          <div className="size-4 rounded-full bg-primary animate-bounce"></div>
          <div className="size-4 rounded-full bg-primary animate-bounce [animation-delay:-.3s]"></div>
          <div className="size-4 rounded-full bg-primary animate-bounce [animation-delay:-.5s]"></div>
        </div>
      </div>
    </div>
  );
}

export default Loader;
