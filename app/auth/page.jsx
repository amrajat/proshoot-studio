import AuthForm from "@/components/auth/AuthForm";
import OAuth from "@/components/auth/OAuth";
import { cookies } from "next/headers";
import TestimonialSlider from "@/app/auth/TestimonialsSlider";
import Header from "@/components/layout/Header";

export default function SignInPage() {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 overflow-y-auto">
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
                <p className="block text-xs mt-1 text-center text-muted-foreground">
                  You don't need to create account/password here. We use modern
                  authentication which allows you to access your account with
                  your existing social accounts or passcode based email login.
                </p>
                {/* End Form */}
              </div>
            </div>
          </div>
        </div>
        <TestimonialSlider />
      </div>
    </div>
  );
}
