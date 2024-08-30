function Button({ children, onClick, disabled = false, cls = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none ${cls}`}
    >
      {children}
    </button>
  );
}

export default Button;
