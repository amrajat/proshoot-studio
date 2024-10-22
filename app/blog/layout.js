import { Suspense } from "react";
// import HeaderBlog from "./_assets/components/HeaderBlog";
import BlogNavBar from "./_assets/components/BlogNavBar.js";
import Footer from "@/components/homepage/Footer";
import Header from "@/components/homepage/Header.jsx";

export default async function LayoutBlog({ children }) {
  return (
    <div>
      <Header />
      <Suspense>
        {/* <HeaderBlog /> */}
        <BlogNavBar />
      </Suspense>

      <main className="min-h-screen max-w-6xl mx-auto p-8">{children}</main>

      <div className="h-24" />

      <Footer />
    </div>
  );
}
