import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CardArticle({ article, isImagePriority = false }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={article.image.src}
            alt={article.image.alt}
            fill
            className="object-cover transition-transform hover:scale-105"
            priority={isImagePriority}
          />
        </div>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            {article.categories.map((category) => (
              <Badge key={category.slug} variant="secondary">
                {category.title}
              </Badge>
            ))}
          </div>
          <h2 className="text-xl font-semibold line-clamp-2">
            {article.title}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">
            {article.description}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={article.author.avatar}
                alt={article.author.name}
              />
              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {article.author.name}
            </span>
          </div>
          <time
            className="text-sm text-muted-foreground"
            dateTime={article.publishedAt}
          >
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </CardFooter>
      </Link>
    </Card>
  );
}
