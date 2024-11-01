import Header from "@/components/layout/Header";
import Logo from "@/components/homepage/Logo";
import AuthForm from "@/components/auth/AuthForm";
import OAuth from "@/components/auth/OAuth";
import Heading from "@/components/shared/Heading";
import Image from "next/image";
import { cookies } from "next/headers";

export const metadata = {
  title: { absolute: "Login" },
  description:
    "Access your Proshoot.co account & generate stunning AI headshots in seconds. Login or sign up for free today!",
};

// function AuthPage() {
//   return (
//     <>
//       <Header />
//       <main className="w-full h-svh bg-red-200 flex justify-center items-center">
//         <div className="max-w-md mx-auto bg-white border border-gray-200 rounded shadow-sm">
//           <div className="p-4 sm:p-7">
//             <div className="text-center">
//               <div className="text-center flex justify-center">
//                 <Logo />
//               </div>

//               <h1 className="block text-2xl font-bold mt-6">Login</h1>
//               <p className="block text-xs mt-1">
//                 With One Time Password (OTP).
//               </p>
//             </div>
//             <div className="mt-5">
//               {/* <OAuth /> */}

//               {/* <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6   ">
//                 Or
//               </div> */}
//               {/* Form */}
//               <AuthForm />
//               <p className="block text-xs mt-1 text-center">
//                 You don't need to create account/password here. We use modern
//                 authentication which allows you to access your account with one
//                 time password or passcode.
//               </p>
//               {/* End Form */}
//             </div>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }

// export default AuthPage;

function AuthPage() {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;
  return (
    <>
      <Header />
      <main className="grid gap-0 md:h-screen md:grid-cols-2">
        {/* Component */}
        <div className="flex items-start justify-center px-5 py-16 md:px-10 md:py-20">
          <div className="max-w-md text-center">
            {/* Form */}
            <div className="mx-auto max-w-sm mb-4 pb-4 border border-gray-200 rounded shadow-sm bg-white">
              <div className="p-4 sm:p-7">
                <div className="text-center">
                  {/* <div className="text-center flex justify-center">
                    <Logo type="blue" />
                  </div> */}

                  <h1 className="block text-2xl font-bold mt-6">Get Started</h1>
                  <p className="block text-xs mt-1">
                    with one click social login or email login.
                  </p>
                </div>
                <div className="mt-5">
                  <OAuth provider={"google"} />

                  <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6   ">
                    Or
                  </div>
                  <OAuth provider={"linkedin_oidc"} />
                  <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6   ">
                    Or continue with email
                  </div>
                  {/* Form */}
                  <AuthForm lastSignedInMethod={lastSignedInMethod} />
                  <p className="block text-xs mt-1 text-center">
                    You don't need to create account/password here. We use
                    modern authentication which allows you to access your
                    account with your existing social accounts or passcode based
                    email login.
                  </p>
                  {/* End Form */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Component */}
        <div className="flex items-center justify-center hero-moving-bg text-white">
          <div className="absolute mx-auto max-w-3xl px-5 py-16 md:px-10 md:py-24 lg:py-32">
            <div className="shrink-0 flex justify-start gap-x-1 mb-3">
              <svg
                className="size-4 text-yellow-400"
                width={51}
                height={51}
                viewBox="0 0 51 51"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M27.0352 1.6307L33.9181 16.3633C34.2173 16.6768 34.5166 16.9903 34.8158 16.9903L50.0779 19.1845C50.9757 19.1845 51.275 20.4383 50.6764 21.0652L39.604 32.3498C39.3047 32.6632 39.3047 32.9767 39.3047 33.2901L41.998 49.2766C42.2973 50.217 41.1002 50.8439 40.5017 50.5304L26.4367 43.3208C26.1375 43.3208 25.8382 43.3208 25.539 43.3208L11.7732 50.8439C10.8754 51.1573 9.97763 50.5304 10.2769 49.59L12.9702 33.6036C12.9702 33.2901 12.9702 32.9767 12.671 32.6632L1.29923 21.0652C0.700724 20.4383 0.999979 19.4979 1.89775 19.4979L17.1598 17.3037C17.459 17.3037 17.7583 16.9903 18.0575 16.6768L24.9404 1.6307C25.539 0.69032 26.736 0.69032 27.0352 1.6307Z"
                  fill="currentColor"
                />
              </svg>
              <svg
                className="size-4 text-yellow-400"
                width={51}
                height={51}
                viewBox="0 0 51 51"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M27.0352 1.6307L33.9181 16.3633C34.2173 16.6768 34.5166 16.9903 34.8158 16.9903L50.0779 19.1845C50.9757 19.1845 51.275 20.4383 50.6764 21.0652L39.604 32.3498C39.3047 32.6632 39.3047 32.9767 39.3047 33.2901L41.998 49.2766C42.2973 50.217 41.1002 50.8439 40.5017 50.5304L26.4367 43.3208C26.1375 43.3208 25.8382 43.3208 25.539 43.3208L11.7732 50.8439C10.8754 51.1573 9.97763 50.5304 10.2769 49.59L12.9702 33.6036C12.9702 33.2901 12.9702 32.9767 12.671 32.6632L1.29923 21.0652C0.700724 20.4383 0.999979 19.4979 1.89775 19.4979L17.1598 17.3037C17.459 17.3037 17.7583 16.9903 18.0575 16.6768L24.9404 1.6307C25.539 0.69032 26.736 0.69032 27.0352 1.6307Z"
                  fill="currentColor"
                />
              </svg>
              <svg
                className="size-4 text-yellow-400"
                width={51}
                height={51}
                viewBox="0 0 51 51"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M27.0352 1.6307L33.9181 16.3633C34.2173 16.6768 34.5166 16.9903 34.8158 16.9903L50.0779 19.1845C50.9757 19.1845 51.275 20.4383 50.6764 21.0652L39.604 32.3498C39.3047 32.6632 39.3047 32.9767 39.3047 33.2901L41.998 49.2766C42.2973 50.217 41.1002 50.8439 40.5017 50.5304L26.4367 43.3208C26.1375 43.3208 25.8382 43.3208 25.539 43.3208L11.7732 50.8439C10.8754 51.1573 9.97763 50.5304 10.2769 49.59L12.9702 33.6036C12.9702 33.2901 12.9702 32.9767 12.671 32.6632L1.29923 21.0652C0.700724 20.4383 0.999979 19.4979 1.89775 19.4979L17.1598 17.3037C17.459 17.3037 17.7583 16.9903 18.0575 16.6768L24.9404 1.6307C25.539 0.69032 26.736 0.69032 27.0352 1.6307Z"
                  fill="currentColor"
                />
              </svg>
              <svg
                className="size-4 text-yellow-400"
                width={51}
                height={51}
                viewBox="0 0 51 51"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M27.0352 1.6307L33.9181 16.3633C34.2173 16.6768 34.5166 16.9903 34.8158 16.9903L50.0779 19.1845C50.9757 19.1845 51.275 20.4383 50.6764 21.0652L39.604 32.3498C39.3047 32.6632 39.3047 32.9767 39.3047 33.2901L41.998 49.2766C42.2973 50.217 41.1002 50.8439 40.5017 50.5304L26.4367 43.3208C26.1375 43.3208 25.8382 43.3208 25.539 43.3208L11.7732 50.8439C10.8754 51.1573 9.97763 50.5304 10.2769 49.59L12.9702 33.6036C12.9702 33.2901 12.9702 32.9767 12.671 32.6632L1.29923 21.0652C0.700724 20.4383 0.999979 19.4979 1.89775 19.4979L17.1598 17.3037C17.459 17.3037 17.7583 16.9903 18.0575 16.6768L24.9404 1.6307C25.539 0.69032 26.736 0.69032 27.0352 1.6307Z"
                  fill="currentColor"
                />
              </svg>
              <svg
                className="size-4 text-yellow-400"
                width={51}
                height={51}
                viewBox="0 0 51 51"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M27.0352 1.6307L33.9181 16.3633C34.2173 16.6768 34.5166 16.9903 34.8158 16.9903L50.0779 19.1845C50.9757 19.1845 51.275 20.4383 50.6764 21.0652L39.604 32.3498C39.3047 32.6632 39.3047 32.9767 39.3047 33.2901L41.998 49.2766C42.2973 50.217 41.1002 50.8439 40.5017 50.5304L26.4367 43.3208C26.1375 43.3208 25.8382 43.3208 25.539 43.3208L11.7732 50.8439C10.8754 51.1573 9.97763 50.5304 10.2769 49.59L12.9702 33.6036C12.9702 33.2901 12.9702 32.9767 12.671 32.6632L1.29923 21.0652C0.700724 20.4383 0.999979 19.4979 1.89775 19.4979L17.1598 17.3037C17.459 17.3037 17.7583 16.9903 18.0575 16.6768L24.9404 1.6307C25.539 0.69032 26.736 0.69032 27.0352 1.6307Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <Heading type="h4" cls="text-white">
              way better than traditional photography, and much cheaper.
              you&apos;ll love it...
            </Heading>
            <div className="flex items-center gap-x-3 mt-2">
              <div className="shrink-0">
                <Image
                  className="size-8 sm:h-[2.875rem] sm:w-[2.875rem] rounded-full"
                  src="/avatar-3.jpg"
                  width={64}
                  height={64}
                  alt="Avatar"
                />
              </div>
              <div className="grow">
                <p className="text-lg">J. Tyson</p>
                <p className="text-xs">Product Manager | F500</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default AuthPage;
