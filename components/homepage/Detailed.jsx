function Detailed() {
  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      {/* Title */}
      <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
        <h2 className="text-xl leading-tight font-bold md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-700 text-transparent">
          The Most Detailed Headshot Generator with AI.
        </h2>
      </div>
      {/* End Title */}
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div className="text-center">
          <div className="overflow-hidden">
            <img
              className="rounded-xl sm:size-48 lg:size-60 mx-auto"
              src="/amazon-employee.png"
              alt="Image Description"
            />
          </div>
          <div className="mt-2 sm:mt-4">
            <h3 className="text-sm font-medium text-gray-800 sm:text-base lg:text-lg dark:text-gray-200">
              Image Scale 1X
            </h3>
          </div>
        </div>
        {/* End Col */}
        <div className="text-center">
          <div className="relative overflow-hidden rounded-xl sm:size-48 lg:size-60 mx-auto">
            <img
              className="absolute top-0 right-0 transform translate-x-1 -translate-y-[-30%] rounded-xl sm:size-48 lg:size-60 scale-[2.5]"
              src="/amazon-employee.png"
              alt="Image Description"
            />
          </div>

          <div className="mt-2 sm:mt-4">
            <h3 className="text-sm font-medium text-gray-800 sm:text-base lg:text-lg dark:text-gray-200">
              Image Scale 2.5X
            </h3>
          </div>
        </div>
        {/* End Col */}
        <div className="text-center">
          <div className="relative overflow-hidden rounded-xl sm:size-48 lg:size-60 mx-auto">
            <img
              className="absolute top-0 right-0 transform translate-x-1 -translate-y-[-60%] rounded-xl sm:size-48 lg:size-60 scale-[5]"
              src="/amazon-employee.png"
              alt="Image Description"
            />
          </div>
          <div className="mt-2 sm:mt-4">
            <h3 className="text-sm font-medium text-gray-800 sm:text-base lg:text-lg dark:text-gray-200">
              Image Scale 5X
            </h3>
          </div>
        </div>
        {/* End Col */}
      </div>
      {/* End Grid */}
    </div>
  );
}

export default Detailed;
