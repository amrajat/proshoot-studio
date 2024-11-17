import Link from "next/link";
import { Button } from "@/components/ui/button";
import Heading from "../shared/heading";

export default function CoverPage({ title, children, buttonText, buttonLink }) {
  return (
    <div className="text-center space-y-4">
      <Heading as="h2" variant={"hero"}>
        {title}
      </Heading>
      <p className="text-xl text-muted-foreground">{children}</p>
      <Button asChild size="lg">
        <Link href={buttonLink}>{buttonText}</Link>
      </Button>
    </div>
  );
}
