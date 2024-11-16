import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const headshotTypes = [
  {
    slug: "linkedin-headshots",
    title: "LinkedIn Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "model-headshots",
    title: "Model Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "realtor-headshots",
    title: "Realtor Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "executive-headshots",
    title: "Executive Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "medical-headshots",
    title: "Medical Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "corporate-headshots",
    title: "Corporate Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "actor-headshots",
    title: "Actor Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "tech-headshots",
    title: "Tech Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "creative-headshots",
    title: "Creative Headshots",
    image: "/placeholder.svg",
  },
  {
    slug: "eras-headshots",
    title: "Eras Headshots",
    image: "/placeholder.svg",
  },
];

export default function HeadshotTypesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Headshot Types</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {headshotTypes.map((type) => (
          <Card key={type.slug} className="overflow-hidden">
            <CardHeader className="p-0">
              <Image
                src={type.image}
                alt={type.title}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-xl mb-2">{type.title}</CardTitle>
              <p className="text-muted-foreground">
                Professional {type.title.toLowerCase()} for your perfect profile
                picture.
              </p>
            </CardContent>
            <CardFooter className="p-4">
              <Link
                href={`/headshot-type/${type.slug}`}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Learn More
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
