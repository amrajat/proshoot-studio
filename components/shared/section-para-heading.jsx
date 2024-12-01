import { Badge } from "@/components/ui/badge";

function SectionParaHeading({ badgeText, title, children }) {
  return (
    <div className="text-center mb-12">
      {/* <Badge className="mb-4 uppercase font-bold tracking-tighter lg:tracking-[1]">
        {badgeText}
      </Badge> */}
      <h2 className="lowercase text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] text-center mb-4">
        {title}
      </h2>
      <p className="text-lg font-light text-foreground mb-8 text-center max-w-4xl mx-auto">
        {children}
      </p>
    </div>
  );
}

export default SectionParaHeading;
