import { string } from "zod";

export default function sitemap() {
  const paths = [
    "about",
    "affiliate",
    "api",
    "auth",
    "blog",
    "contact",
    // "dashboard",
    "free-ai-headshot-generator-examples",
    "free-ai-portrait-generator",
    // "legal",
  ].map((path) => {
    return {
      url: `${process.env.URL}/${path}`,
    };
  });

  return [
    {
      url: `${process.env.URL}`,
    },
    ...paths,
  ];
}
