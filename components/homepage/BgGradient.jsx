function BgGradient() {
  return (
    <div aria-hidden="true" className="flex absolute -top-48 start-0 -z-[1]">
      <div className="bg-blue-200 opacity-30 blur-3xl w-[1036px] h-[600px]  " />
      <div className="bg-slate-200 opacity-90 blur-3xl w-[577px] h-[300px] transform translate-y-32 " />
    </div>
  );
}

export default BgGradient;
