import Image from "next/image";
import Heading, { SubHeading } from "../ui/Heading";
import { Process } from "@/components/magicui/Process";
export default function HowItWorks() {
  return (
    <section className="py-12">
      <Process />
    </section>
  );
}
