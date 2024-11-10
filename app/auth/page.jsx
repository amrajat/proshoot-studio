import AuthForm from "@/components/auth/AuthForm";
import OAuth from "@/components/auth/OAuth";
import { cookies } from "next/headers";
import TestimonialSlider from "@/app/auth/TestimonialsSlider";
import Header from "@/components/layout/Header";

export default function SignInPage() {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;

  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-100px)]">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 overflow-y-auto">
          <div className="mx-auto w-full max-w-sm lg:w-96 bg-gradient-to-b from-secondary to-background">
            <div className="p-4 sm:p-7">
              <div className="text-center">
                <h1 className="block text-2xl font-bold mt-6">Get Started</h1>
                <p className="block text-xs mt-1">
                  with one click social login or email login.
                </p>
              </div>
              <div className="mt-5">
                <OAuth provider={"google"} />

                <div className="py-3 flex items-center text-xs uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6   ">
                  Or
                </div>
                <OAuth provider={"linkedin_oidc"} />
                <div className="py-3 flex items-center text-xs uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6   ">
                  Or continue with email
                </div>
                {/* Form */}
                <AuthForm lastSignedInMethod={lastSignedInMethod} />
                {/* End Form */}
              </div>
            </div>
          </div>
        </div>
        <TestimonialSlider />
      </div>
    </>
  );
}
