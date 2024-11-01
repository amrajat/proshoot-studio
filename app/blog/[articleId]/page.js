import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { articles } from "../_assets/content";
import config from "@/config";

export async function generateMetadata({ params }) {
  const article = articles.find((article) => article.slug === params.articleId);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${config.baseUrl}/blog/${article.slug}`,
      siteName: config.appName,
      images: [
        {
          url: `${config.baseUrl}${article.image.urlRelative}`,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [`${config.baseUrl}${article.image.urlRelative}`],
    },
  };
}

export default function ArticlePage({ params }) {
  const article = articles.find((article) => article.slug === params.articleId);

  if (!article) {
    return <div>Article not found</div>;
  }

  const articlesRelated = articles
    .filter(
      (a) =>
        a.slug !== params.articleId &&
        a.categories.some((c) =>
          article.categories.map((c) => c.slug).includes(c.slug)
        )
    )
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Link>

      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-4">
            {article.categories.map((category) => (
              <Badge key={category.slug} variant="secondary">
                {category.title}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {article.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={article.publishedAt}>
              Published:{" "}
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <time dateTime={article.modifiedAt}>
              Updated:{" "}
              {new Date(article.modifiedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
        </header>

        <Image
          src={article.image.urlRelative}
          alt={article.image.alt}
          width={1200}
          height={630}
          className="rounded-lg mb-12"
          priority
        />

        <div className="prose prose-lg max-w-none mb-12">{article.content}</div>

        <footer className="border-t pt-8">
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={article.author.avatar}
                alt={article.author.name}
              />
              <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{article.author.name}</p>
              <p className="text-sm text-muted-foreground">
                {article.author.bio}
              </p>
            </div>
          </div>

          {articlesRelated.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Related Articles</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {articlesRelated.map((relatedArticle) => (
                  <Card key={relatedArticle.slug}>
                    <CardContent className="p-4">
                      <Link
                        href={`/blog/${relatedArticle.slug}`}
                        className="block"
                      >
                        <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {relatedArticle.description}
                        </p>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </footer>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${config.baseUrl}/blog/${article.slug}`,
            },
            headline: article.title,
            description: article.description,
            image: `${config.baseUrl}${article.image.urlRelative}`,
            datePublished: article.publishedAt,
            dateModified: article.modifiedAt,
            author: {
              "@type": "Person",
              name: article.author.name,
            },
          }),
        }}
      />
    </div>
  );
}
