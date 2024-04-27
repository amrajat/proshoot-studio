import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";

export const metadata = {
  title: "Blog",
  description:
    "Discover the latest trends & insights on AI headshots. Proshoot.co's blog empowers professionals with headshot creation tips.",
};

function Blog() {
  return (
    <>
      <Header />
      {/* Blog Article */}

      <Container>
        {/* Content */}
        <div className="space-y-5 md:space-y-8">
          {/* <div className="space-y-3"> */}
          <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
            Blog
          </h1>
          <p className="text-lg text-gray-800 dark:text-neutral-200">
            No articles yet.
          </p>
          {/* </div> */}
        </div>
        {/* End Content */}
      </Container>
      {/* End Blog Article */}
      <Footer />
    </>
  );
}

export default Blog;
