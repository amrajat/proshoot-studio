import Header from "@/components/homepage/Header";
import Logo from "@/components/homepage/Logo";
import AuthForm from "@/components/auth/AuthForm";
import OAuth from "@/components/auth/OAuth";

export const metadata = {
  title: { absolute: "Login" },
  description:
    "Access your Proshoot.co account & generate stunning AI headshots in seconds. Login or sign up for free today!",
};

function AuthPage() {
  return (
    <>
      <Header />
      <main className="w-full max-w-md mx-auto p-6">
        <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <div className="text-center flex justify-center">
                <Logo />
              </div>

              <h1 className="block text-2xl font-bold text-gray-800 dark:text-white mt-6">
                Login
              </h1>
              <p className="block text-xs mt-1 text-gray-800 dark:text-gray-300">
                With One Time Password (OTP).
              </p>
            </div>
            <div className="mt-5">
              {/* <OAuth /> */}

              {/* <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-6 dark:text-gray-500 dark:before:border-gray-600 dark:after:border-gray-600">
                Or
              </div> */}
              {/* Form */}
              <AuthForm />
              <p className="block text-xs mt-1 text-center text-gray-800 dark:text-gray-300">
                You don't need to create account/password here. We use modern
                authentication which allows you to access your account with one
                time password or passcode.
              </p>
              {/* End Form */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default AuthPage;
