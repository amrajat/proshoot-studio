import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";
import Container from "@/components/dashboard/Container";
import Link from "next/link";
import Script from "next/script";
import { redirect } from "next/navigation";

export const metadata = {
  title: { absolute: "Thank you!" },
  robots: {
    index: false,
    follow: true,
  },
};
function Message({ searchParams }) {
  console.log(searchParams);
  if (
    searchParams.type === "message" &&
    searchParams?.email !== "" &&
    searchParams?.email !== undefined
  )
    return (
      <>
        <Script src="//cdn.trackdesk.com/tracking.js" />
        <Script id="trackdesk-email-tracking">
          {`(function(t,d,k){(t[k]=t[k]||[]).push(d);t[d]=t[d]||t[k].f||function(){(t[d].q=t[d].q||[]).push(arguments)}})(window,"trackdesk","TrackdeskObject");
        trackdesk('proshoot', 'externalCid', {
          externalCid: ${searchParams?.email},
          revenueOriginId: '43483c3b-16e7-4c31-bb07-e3aa347f5ea8'
});`}
        </Script>
        <Header />
        {/* Blog Article */}

        <Container>
          {/* Content */}
          <div className="space-y-5 md:space-y-8">
            <h1 className="text-2xl font-bold md:text-3xl dark:text-white">
              Thank you! Payment Successful!
            </h1>
            <Link
              className="py-2.5 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-violet-900 text-white hover:bg-violet-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              href="/dashboard/studio/create"
            >
              Create Studio
            </Link>
          </div>
          {/* End Content */}
        </Container>
        {/* End Blog Article */}
        <Footer />
      </>
    );
  else return redirect("/auth");
}

export default Message;
