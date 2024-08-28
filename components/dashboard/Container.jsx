function Container({ children, cls = "" }) {
  return (
    <div
      className={`max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto ${cls}`}
    >
      {children}
    </div>
  );
}

export default Container;
