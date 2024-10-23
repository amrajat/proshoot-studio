import { categories, articles } from "./_assets/content";
import CardArticle from "./_assets/components/CardArticle";
import CardCategory from "./_assets/components/CardCategory";
import config from "@/config";
import { getSEOTags } from "@/lib/seo";

export const metadata = getSEOTags({
  title: `${config.appName} Blog | Best AI Headshots.`,
  description:
    // learn about AI, ai headshots, building softwares and online personal brand.

    "Learn how to utilize artificial inteligence for your business needs to grow faster in your career. We also share information about ai headshots.",
  canonicalUrlRelative: "/blog",
});

export default async function Blog() {
  const articlesToDisplay = articles
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 6);
  return (
    <>
      <section className="text-center max-w-xl mx-auto mt-6 mb-12 md:mb-16">
        <h1 className="font-medium text-xl lg:text-3xl tracking-tight mb-6">
          The {config.appName} Blog
        </h1>
        <p>
          learn about AI, ai headshots, building softwares and online personal
          brand.
        </p>
      </section>

      <section className="grid lg:grid-cols-2 mb-24 md:mb-32 gap-8">
        {articlesToDisplay.map((article, i) => (
          <CardArticle
            article={article}
            key={article.slug}
            isImagePriority={i <= 2}
          />
        ))}
      </section>

      <section>
        <p className="font-bold text-2xl lg:text-4xl tracking-tight text-center mb-8 md:mb-12">
          Browse articles by category
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CardCategory key={category.slug} category={category} tag="div" />
          ))}
        </div>
      </section>
    </>
  );
}
