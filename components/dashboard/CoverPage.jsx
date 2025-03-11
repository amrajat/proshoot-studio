"use client";
import { Button } from "@/components/ui/button";
import Heading from "../shared/heading";
import { MessageCircle } from "lucide-react";

export default function CoverPage({ title, children, buttonText, buttonLink }) {
  return (
    <div className="text-center space-y-4">
      <Heading as="h2" variant={"hero"}>
        {title}
      </Heading>
      {children}
      {/* <Button asChild size="lg">
        <Link href={buttonLink}>{buttonText}</Link>
      </Button> */}
      <Button
        variant="default"
        size="lg"
        onClick={() => {
          if (window.Intercom) window.Intercom("showSpace", "messages");
        }}
      >
        <MessageCircle />
        Contact Support
      </Button>
    </div>
  );
}
