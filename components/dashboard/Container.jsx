import { cn } from "@/lib/utils";

function Container({ children, className = "" }) {
  return (
    <div
      className={cn(
        "container px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
