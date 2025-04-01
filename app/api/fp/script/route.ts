import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://cdn.firstpromoter.com/fpr.js");
    let script = await response.text();

    // Replace FirstPromoter URLs with our proxy URLs
    script = script
      .replace(/https:\/\/t\.firstpromoter\.com\/tr/g, "/fp/track")
      .replace(/https:\/\/t\.firstpromoter\.com\/get_details/g, "/fp/details");

    return new NextResponse(script, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching FirstPromoter script:", error);
    return new NextResponse(
      'console.error("Failed to load FirstPromoter script");',
      {
        headers: {
          "Content-Type": "application/javascript",
        },
        status: 500,
      }
    );
  }
}
