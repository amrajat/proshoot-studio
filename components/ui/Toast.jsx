import { useState, useEffect, useRef } from "react";

function Toast() {
  const [isVisible, setIsVisible] = useState(true);
  const [progressBarWidth, setProgressBarWidth] = useState(100);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // 5 seconds

    const animationInterval = setInterval(() => {
      setProgressBarWidth((prevWidth) => {
        if (prevWidth <= 0) {
          clearInterval(animationInterval);
          return 0;
        }
        return prevWidth - 1;
      });
    }, 50);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(animationInterval);
    };
  }, []);

  return (
    isVisible && (
      <div
        className="translate-x-5 :opacity-0 transition-all duration-300 max-w-xs bg-white border border-gray-200 rounded shadow-lg fixed bottom-4 right-4"
        role="alert"
        tabIndex={-1}
        aria-labelledby="hs-toast-dismiss-button-label"
      >
        <div className="flex p-8 relative">
          {/* Added relative for positioning */}
          <div className="flex flex-col w-full">
            {/* Added flex-col for stacking */}
            <p className="text-sm text-gray-700">Your email has been sent</p>
            <div className="h-1 bg-gray-200 mt-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${progressBarWidth}%` }}
              ></div>
            </div>
          </div>
          <div className="ms-auto absolute top-4 right-4">
            {/* Absolute positioning */}
            <button
              type="button"
              className="inline-flex shrink-0 justify-center items-center size-5 rounded-lg text-gray-800 opacity-50 hover:opacity-100 focus:outline-none focus:opacity-100"
              aria-label="Close"
              data-hs-remove-element="#dismiss-toast"
              onClick={() => setIsVisible(false)} // Close on button click
            >
              <span className="sr-only">Close</span>
              <svg
                className="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default Toast;
