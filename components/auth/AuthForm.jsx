"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  signInWithEmailOTP,
  verifyEmailOTP,
} from "@/lib/supabase/actions/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
// FIXME: REPLACE YUP WITH ZOD VALIDATION and import supabase from client not server.
function AuthForm() {
  const [displayError, setDisplayError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const router = useRouter();

  const emailSchema = z.object({
    email: z
      .string()
      .email("Please use valid email.")
      .min(1, "Email is required."),
  });

  const tokenSchema = z.object({
    token1: z.string().min(1).max(1, { message: "OTP is required." }),
    token2: z.string().min(1).max(1, { message: "OTP is required." }),
    token3: z.string().min(1).max(1, { message: "OTP is required." }),
    token4: z.string().min(1).max(1, { message: "OTP is required." }),
    token5: z.string().min(1).max(1, { message: "OTP is required." }),
    token6: z.string().min(1).max(1, { message: "OTP is required." }),
  });

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerToken,
    handleSubmit: handleSubmitToken,
    formState: { errors: errorsToken },
  } = useForm({
    resolver: zodResolver(tokenSchema),
  });

  async function signInWithEmail({ email }) {
    try {
      setIsLoading(true);
      const { data, error } = await signInWithEmailOTP(email);
      localStorage.setItem("email", email);
      setUserEmail(email);
      setDisplayError(null);
    } catch (error) {
      setDisplayError(error.message.slice("AuthApiError:".length).trim());
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyEmailWithOTP({
    token1,
    token2,
    token3,
    token4,
    token5,
    token6,
  }) {
    try {
      setIsLoading(true);
      const token = token1 + token2 + token3 + token4 + token5 + token6;
      const email = localStorage.getItem("email");
      const { data, error } = await verifyEmailOTP(email, token);
      localStorage.removeItem("email");
      setDisplayError(null);
      router.push("/dashboard");
    } catch (error) {
      setDisplayError(error.message.slice("AuthApiError:".length).trim());
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* EMAIL FORM START */}

      <form
        key={1}
        action={handleSubmitEmail(signInWithEmail)}
        disabled={isLoading}
        className={`${userEmail ? "hidden" : ""}`}
      >
        <div className="grid gap-y-4">
          {/* Form Group */}

          <div className="relative">
            <input
              {...registerEmail("email")}
              type="email"
              id="hs-hero-signup-form-floating-input-email"
              className="peer p-4 block w-full bg-gray-100 border-transparent rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:focus:ring-neutral-600
              focus:pt-6
              focus:pb-2
              [&:not(:placeholder-shown)]:pt-6
              [&:not(:placeholder-shown)]:pb-2
              autofill:pt-6
              autofill:pb-2"
              placeholder="you@email.com"
              autoComplete="email"
              required
            />
            <p className="text-xs text-red-600 mt-2" id="email-error">
              {errorsEmail.email ? errorsEmail.email?.message : displayError}
            </p>

            <label
              htmlFor="hs-hero-signup-form-floating-input-email"
              className="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent dark:text-white peer-disabled:opacity-50 peer-disabled:pointer-events-none
                  peer-focus:text-xs
                  peer-focus:-translate-y-1.5
                  peer-focus:text-gray-500
                  peer-[:not(:placeholder-shown)]:text-xs
                  peer-[:not(:placeholder-shown)]:-translate-y-1.5
                  peer-[:not(:placeholder-shown)]:text-gray-500"
            >
              Email
            </label>
          </div>

          {/* End Form Group */}
          {/* End Checkbox */}
          <button
            type="submit"
            className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
          >
            {!isLoading ? "Send OTP" : "Sending OTP"}
          </button>
        </div>
      </form>

      {/* EMAIL FORM END */}

      {/* OTP INPUT FORM START */}

      <form
        key={2}
        action={handleSubmitToken(verifyEmailWithOTP)}
        className={`grid gap-y-4 ${!userEmail ? "hidden" : ""}`}
      >
        <p className="block text-xs mt-1 text-gray-800 dark:text-gray-300">
          Please enter 6 digit One Time Password (OTP) received on your email
          inbox. Don&apos;t forget to check spam folder.
        </p>
        <div
          id="pin-input"
          className={`flex space-x-3 justify-evenly`}
          data-hs-pin-input='{
"availableCharsRE": "^[0-9]+$"
}'
        >
          <input
            {...registerToken("token1")}
            type="text"
            className="block w-[38px] h-[38px] text-center bg-gray-200 border-transparent rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            data-hs-pin-input-item=""
            autoFocus={false}
            disabled={isLoading || !userEmail}
          />
          <input
            {...registerToken("token2")}
            type="text"
            className="block w-[38px] h-[38px] text-center bg-gray-200 border-transparent rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            data-hs-pin-input-item=""
            disabled={isLoading || !userEmail}
          />
          <input
            {...registerToken("token3")}
            type="text"
            className="block w-[38px] h-[38px] text-center bg-gray-200 border-transparent rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            data-hs-pin-input-item=""
            disabled={isLoading || !userEmail}
          />
          <input
            {...registerToken("token4")}
            type="text"
            className="block w-[38px] h-[38px] text-center bg-gray-200 border-transparent rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            data-hs-pin-input-item=""
            disabled={isLoading || !userEmail}
          />
          <input
            {...registerToken("token5")}
            type="text"
            className="block w-[38px] h-[38px] text-center bg-gray-200 border-transparent rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            data-hs-pin-input-item=""
            disabled={isLoading || !userEmail}
          />
          <input
            {...registerToken("token6")}
            type="text"
            className="block w-[38px] h-[38px] text-center bg-gray-200 border-transparent rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            data-hs-pin-input-item=""
            disabled={isLoading || !userEmail}
          />
        </div>
        <p className="text-xs text-red-600 mt-2" id="email-error">
          {errorsToken.token6 ? errorsToken.token6?.message : displayError}
        </p>
        <Link
          href={"#"}
          className="text-right"
          onClick={() => {
            setUserEmail(null);
          }}
        >
          &larr;&nbsp;Back
        </Link>

        <button
          type="submit"
          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
        >
          {!isLoading ? "Login" : "Verifying OTP"}
        </button>
      </form>

      {/* OTP INPUT FORM END */}
    </>
  );
}

export default AuthForm;
