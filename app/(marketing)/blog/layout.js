import { Suspense } from "react";
import Footer from "@/components/homepage/Footer";
import Header from "@/components/layout/Header.jsx";

export default async function LayoutBlog({ children }) {
  return (
    <div>
      <Header />
      <Suspense></Suspense>

      <main className="min-h-screen max-w-6xl mx-auto p-8">{children}</main>

      <div className="h-24" />

      <Footer />
    </div>
  );
}
