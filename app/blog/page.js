import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CardArticle from "@/app/blog/_assets/components/CardArticle";
import CardCategory from "@/app/blog/_assets/components/CardCategory";
import { categories, articles } from "./_assets/content";
import config from "@/config";

export const metadata = {
  title: `${config.appName} Blog | Best AI Headshot Generator`,
  description:
    "Learn how to utilize artificial intelligence for your business needs to grow faster in your career. We also share information about AI headshots.",
  openGraph: {
    title: `${config.appName} Blog | Best AI Headshot Generator`,
    description:
      "Learn how to utilize artificial intelligence for your business needs to grow faster in your career. We also share information about AI headshots.",
    url: `${config.baseUrl}/blog`,
    siteName: config.appName,
    images: [
      {
        url: `${config.baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${config.appName} Blog | Best AI Headshot Generator`,
    description:
      "Learn how to utilize artificial intelligence for your business needs to grow faster in your career. We also share information about AI headshots.",
    images: [`${config.baseUrl}/og-image.jpg`],
  },
  alternates: {
    canonical: `${config.baseUrl}/blog`,
  },
};

export default async function BlogPage({ searchParams }) {
  const currentPage = Number(searchParams.page) || 1;
  const articlesPerPage = 10;
  const totalArticles = articles.length;
  const totalPages = Math.ceil(totalArticles / articlesPerPage);

  const sortedArticles = articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const currentArticles = sortedArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center max-w-2xl mx-auto mt-6 mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          The {config.appName} Blog
        </h1>
        <p className="text-muted-foreground">
          Learn about AI, AI headshots, building software, and online personal
          branding.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {currentArticles.map((article, i) => (
          <CardArticle
            key={article.slug}
            article={article}
            isImagePriority={i < 3}
          />
        ))}
      </section>

      {totalPages > 1 && (
        <Pagination className="my-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? `?page=${currentPage - 1}` : "#"}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`?page=${i + 1}`}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={
                  currentPage < totalPages ? `?page=${currentPage + 1}` : "#"
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <section className="mt-16">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
          Browse articles by category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CardCategory key={category.slug} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
