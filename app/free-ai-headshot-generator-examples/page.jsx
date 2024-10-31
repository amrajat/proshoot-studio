import Header from "@/components/layout/Header";
import Footer from "@/components/homepage/Footer";
import Container from "../../components/dashboard/Container";
import Image from "next/image";
import { HiChevronRight } from "react-icons/hi2";
import Link from "next/link";
import Heading from "@/components/ui/Heading";
// import { EXAMPLES } from "@/lib/data";
import ToolTip from "@/components/homepage/ToolTip";

export const metadata = {
  title: { absolute: "Free AI Headshots Examples" },
  description:
    "See the power of AI headshots! Explore Proshoot.co's free examples & discover the perfect professional look for less.",
};

function Headshots() {
  const EXAMPLES = [
    {
      title: "Incredible results—looked just like a professional photo shoot!",
      thumbnail: "/examples/ai-portrait-1.jpg",
    },
    {
      title: "Fast, affordable, and super realistic. Highly recommend!",
      thumbnail: "/examples/ai-portrait-2.jpg",
    },
    {
      title: "Loved the ethnic integrity in my headshot, very authentic.",
      thumbnail: "/examples/ai-portrait-3.jpg",
    },
    // {
    //   title: "Amazed by how sharp and lifelike my headshot turned out.",
    //   thumbnail: "/examples/ai-portrait-4.jpg",
    // },
    {
      title: "ProShoot.co nailed it! Perfect headshot in just 2 hours.",
      thumbnail: "/examples/ai-portrait-5.jpg",
    },
    {
      title:
        "Way better than traditional photography, and much cheaper. you'll love it...",
      thumbnail: "/examples/ai-portrait-6.jpg",
    },
    // {
    //   title: "My headshot was flawless, no deformities at all!",
    //   thumbnail: "/examples/ai-portrait-7.jpg",
    // },
    {
      title: "So many style options to choose from—impressed!",
      thumbnail: "/examples/ai-portrait-8.jpg",
    },
    // {
    //   title: "Couldn’t believe the quality for the price—top-notch!",
    //   thumbnail: "/examples/ai-portrait-9.jpg",
    // },
    {
      title: "Quick and easy process with stunning results.",
      thumbnail: "/examples/ai-portrait-10.jpg",
    },
    {
      title: "The headshot looks like it was taken in a studio.",
      thumbnail: "/examples/ai-portrait-11.jpg",
    },
    {
      title: "Incredibly detailed and sharp—captured my essence perfectly.",
      thumbnail: "/examples/ai-portrait-12.jpg",
    },
    {
      title: "Exceeded my expectations—worth every penny!",
      thumbnail: "/examples/ai-portrait-13.jpg",
    },
    {
      title:
        "Perfect for updating my LinkedIn profile, looks very professional.",
      thumbnail: "/examples/ai-portrait-14.jpg",
    },
    {
      title: "High resemblance to my actual look—very impressed.",
      thumbnail: "/examples/ai-portrait-15.jpg",
    },
    {
      title: "Fast turnaround, and the quality was amazing!",
      thumbnail: "/examples/ai-portrait-16.jpg",
    },
    {
      title: "Got exactly what I wanted, and it looks so realistic.",
      thumbnail: "/examples/ai-portrait-17.jpg",
    },
    {
      title: "Affordable alternative to a professional photographer.",
      thumbnail: "/examples/ai-portrait-18.jpg",
    },
    {
      title: "The headshots were sharp and looked completely natural.",
      thumbnail: "/examples/ai-portrait-19.jpg",
    },
    // {
    //   title: "Excellent service, my headshot looks fantastic.",
    //   thumbnail: "/examples/ai-portrait-20.jpg",
    // },
    {
      title: "Looks like a real photograph—very happy with the results.",
      thumbnail: "/examples/ai-portrait-21.jpg",
    },
    // {
    //   title: "The AI did an amazing job, my headshot is perfect.",
    //   thumbnail: "/examples/ai-portrait-22.jpg",
    // },
    {
      title: "Such a seamless experience, and the quality is superb.",
      thumbnail: "/examples/ai-portrait-23.jpg",
    },
    {
      title: "Loved the quick delivery and high resolution.",
      thumbnail: "/examples/ai-portrait-24.jpg",
    },
    {
      title: "Better than I expected—sharp, clear, and realistic.",
      thumbnail: "/examples/ai-portrait-25.jpg",
    },
    // {
    //   title: "The headshot looks exactly like me—no weird distortions.",
    //   thumbnail: "/examples/ai-portrait-26.jpg",
    // },
    // {
    //   title: "Saved time and money, and got a great headshot!",
    //   thumbnail: "/examples/ai-portrait-27.jpg",
    // },
    // {
    //   title: "A game-changer for professional photos—so convenient.",
    //   thumbnail: "/examples/ai-portrait-28.jpg",
    // },
    // {
    //   title: "I’m blown away by the clarity and realism.",
    //   thumbnail: "/examples/ai-portrait-29.jpg",
    // },
    // {
    //   title: "Highly recommend for anyone needing a professional headshot.",
    //   thumbnail: "/examples/ai-portrait-30.jpg",
    // },
    // {
    //   title: "The best headshot I’ve ever had, hands down.",
    //   thumbnail: "/examples/ai-portrait-31.jpg",
    // },
    // {
    //   title: "Super easy process with incredible results.",
    //   thumbnail: "/examples/ai-portrait-32.jpg",
    // },
    // {
    //   title: "Loved the variety of styles to choose from!",
    //   thumbnail: "/examples/ai-portrait-33.jpg",
    // },
    // {
    //   title: "The final image was sharp and true to life.",
    //   thumbnail: "/examples/ai-portrait-34.jpg",
    // },
    // {
    //   title: "Quick, affordable, and looks just like me—perfect!",
    //   thumbnail: "/examples/ai-portrait-35.jpg",
    // },
    // {
    //   title: "Impressed with the realistic look of the headshot.",
    //   thumbnail: "/examples/ai-portrait-36.jpg",
    // },
    // {
    //   title: "Great alternative to expensive photo shoots.",
    //   thumbnail: "/examples/ai-portrait-37.jpg",
    // },
    // {
    //   title: "Captured my likeness perfectly, very happy!",
    //   thumbnail: "/examples/ai-portrait-38.jpg",
    // },
    // {
    //   title: "Affordable and high-quality—what more could you ask for?",
    //   thumbnail: "/examples/ai-portrait-39.jpg",
    // },
    // {
    //   title: "The headshot looks so professional, I’m very pleased.",
    //   thumbnail: "/examples/ai-portrait-40.jpg",
    // },
    // {
    //   title: "Fast, reliable, and the quality is unmatched.",
    //   thumbnail: "/examples/ai-portrait-41.jpg",
    // },
    // {
    //   title: "ProShoot.co is my new go-to for professional photos.",
    //   thumbnail: "/examples/ai-portrait-42.jpg",
    // },
    // {
    //   title: "Looks just like a studio photo—amazing quality.",
    //   thumbnail: "/examples/ai-portrait-43.jpg",
    // },
    // {
    //   title: "Exceeded my expectations in every way.",
    //   thumbnail: "/examples/ai-portrait-44.jpg",
    // },
    // {
    //   title: "My headshot turned out better than I imagined.",
    //   thumbnail: "/examples/ai-portrait-45.jpg",
    // },
    // {
    //   title: "Sharp, realistic, and no weird AI artifacts.",
    //   thumbnail: "/examples/ai-portrait-46.jpg",
    // },
    // {
    //   title: "Super affordable and the quality is outstanding.",
    //   thumbnail: "/examples/ai-portrait-47.jpg",
    // },
    // {
    //   title: "The process was smooth, and the results were perfect.",
    //   thumbnail: "/examples/ai-portrait-48.jpg",
    // },
    // {
    //   title: "So impressed with how realistic my headshot looks.",
    //   thumbnail: "/examples/ai-portrait-49.jpg",
    // },
    // {
    //   title: "ProShoot.co delivered exactly what I needed—perfect headshot!",
    //   thumbnail: "/examples/ai-portrait-50.jpg",
    // },
  ];
  return (
    <>
      <Header />
      <div className="relative overflow-hidden">
        {/* Gradients */}
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-violet-300/50 to-purple-100 blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]  " />
          <div className="bg-gradient-to-tl from-blue-50 via-blue-100 to-blue-50 blur-3xl w-[90rem] h-[50rem] roundeds origin-top-left -rotate-12 -translate-x-[15rem]   " />
        </div>
        {/* End Gradients */}
        <div className="relative z-10">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="max-w-4xl text-center mx-auto">
              <p className="inline-block text-sm font-medium bg-clip-text bg-gradient-to-l from-blue-600 to-violet-500 text-transparent  ">
                Proshoot: Headshots Example
              </p>
              {/* Title */}
              <div className="mt-5 max-w-4xl">
                <Heading type="h1">See our AI Headshots</Heading>
              </div>
              {/* End Title */}
              <div className="mt-5 max-w-4xl">
                <p className="text-lg">
                  Curious about the quality of headshots Proshoot.co can
                  generate? Take a look at these examples and discover the
                  potential for professional, personalized portraits created.
                </p>
              </div>
              {/* Buttons */}
              <div className="mt-8 gap-3 flex justify-center flex-col">
                <Link
                  href="/dashboard/studio"
                  className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-base font-semibold rounded border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none self-center"
                >
                  Get Started
                  <HiChevronRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </Link>
                <span className="text-xs font-normal">
                  Trust & Safety - We will not use images without the customer's
                  consent, nor will we sell your pictures to anyone. All photos
                  will be deleted from the server within 30 days. You may
                  request immediate deletion of images by contacting us.
                </span>
              </div>
              {/* End Buttons */}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {EXAMPLES.splice(0, 24).map((example) => {
                return (
                  <div
                    key={example.title}
                    className="relative rounded overflow-hidden group flex flex-col h-full bg-white border border-gray-200 shadow-sm   "
                  >
                    <div className="h-auto ">
                      <Image
                        src={example.thumbnail}
                        width="0"
                        height="0"
                        sizes="100vw"
                        className="w-full h-auto rounded aspect-[2/3] object-cover hover:scale-110 transition-transform"
                        quality={100}
                        alt={"free ai headshot generator"}
                      />
                      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-blue-600/25 pointer-events-none"></div>
                      <span className="absolute left-1 top-1 flex items-center gap-x-1.5 py-1.5 px-3 rounded text-xs font-medium bg-blue-600 text-white">
                        <span className="self-center">AI Generated </span>
                        <ToolTip>
                          These images are artificially generated using our AI
                          headshot generator.
                        </ToolTip>
                      </span>

                      <blockquote className="absolute left-[50%] translate-x-[-50%] bottom-0 inline-flex items-center gap-x-1.5 py-4 px-4 text-sm font-medium text-white italic w-full">
                        <p className="lowercase bg-blue-600/25 backdrop-blur-md px-2 py-1 rounded mb-4 z-10 relative before:content-['\201C'] before:font-serif before:absolute before:top-0 before:left-0 before:text-2xl before:text-blue-400 before:-mt-4 before:-ml-2 after:content-['\201D'] after:font-serif after:absolute after:bottom-0 after:right-0 after:text-2xl after:text-blue-400 after:-mb-4 after:-mr-2">
                          {example.title}
                        </p>
                      </blockquote>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Container></Container>
      <Footer />
    </>
  );
}

export default Headshots;
