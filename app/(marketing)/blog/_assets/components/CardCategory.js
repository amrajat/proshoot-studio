import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function CardCategory({ category }) {
  return (
    <Link href={`/blog/category/${category.slug}`}>
      <Card className="transition-all hover:shadow-md">
        <CardContent className="flex items-center justify-center p-4 h-full">
          <h3 className="text-lg font-medium text-center">
            {category.titleShort || category.title}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
}
