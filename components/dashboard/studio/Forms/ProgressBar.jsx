function ProgressBar({ stepCompleted, totalSteps }) {
  const percentCompleted = parseInt((stepCompleted / totalSteps) * 100);
  return (
    <div
      className="flex w-full h-4 bg-gray-200 rounded overflow-hidden"
      role="progressbar"
      aria-valuenow={percentCompleted}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        className="flex flex-col justify-center rounded overflow-hidden bg-blue-600 text-xs text-white text-center whitespace-nowrap duration-500 transition-all"
        style={{ width: `${percentCompleted}%` }}
      >
        {percentCompleted}%
      </div>
      <p></p>
    </div>
  );
}

export default ProgressBar;
