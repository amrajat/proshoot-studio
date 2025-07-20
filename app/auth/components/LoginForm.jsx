"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

// Multicolored Google Icon
const GoogleIcon = () => (
  <svg
    className="mr-2 h-5 w-5"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5">
    <path
      fill="#0077B5"
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.776 13.019H3.561V9h3.552v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
    />
  </svg>
);

export function LoginForm({ className, ...props }) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [lastLoginMethod, setLastLoginMethod] = useState(null);

  const captchaRef = useRef(null);

  const TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // Default test key for development

  useEffect(() => {
    const storedLastLoginMethod = localStorage.getItem("lastLoginMethod");
    if (storedLastLoginMethod) {
      setLastLoginMethod(storedLastLoginMethod);
    }
  }, []);

  const resetFormState = (clearEmail = false) => {
    setError(null);
    setSuccessMessage(null);
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
    setCaptchaToken(null);
    if (clearEmail) {
      setEmail("");
      setOtp("");
    }
  };

  const getRedirectPath = () => {
    const nextUrl = searchParams.get("next");
    if (nextUrl && nextUrl.startsWith("/")) {
      return nextUrl;
    }
    return "/dashboard";
  };

  const handleGoogleLogin = async () => {
    resetFormState(true);
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const nextUrl = getRedirectPath();
    const finalRedirectTo =
      nextUrl !== "/dashboard"
        ? `${redirectTo}?next=${encodeURIComponent(nextUrl)}`
        : redirectTo;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: finalRedirectTo,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    } else {
      localStorage.setItem("lastLoginMethod", "Google");
    }
  };

  const handleLinkedInLogin = async () => {
    resetFormState(true);
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const nextUrl = getRedirectPath();
    const finalRedirectTo =
      nextUrl !== "/dashboard"
        ? `${redirectTo}?next=${encodeURIComponent(nextUrl)}`
        : redirectTo;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "linkedin",
      options: {
        redirectTo: finalRedirectTo,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    } else {
      localStorage.setItem("lastLoginMethod", "LinkedIn");
    }
  };

  const handleEmailOtpLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!captchaToken && TURNSTILE_SITE_KEY !== "1x00000000000000000000AA") {
      setError("Please complete the CAPTCHA challenge.");
      return;
    }
    resetFormState();
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const nextUrl = getRedirectPath();
    const emailRedirectFinal =
      nextUrl !== "/dashboard"
        ? `${redirectTo}?method=otp&next=${encodeURIComponent(nextUrl)}`
        : `${redirectTo}?method=otp`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: emailRedirectFinal,
        captchaToken,
      },
    });
    if (otpError) {
      setError(otpError.message);
    } else {
      setSuccessMessage(`Please check your inbox/spam folder.`);
      setShowOtpInput(true);
      localStorage.setItem("lastLoginMethod", "OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    resetFormState();
    setLoading(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
    } else if (data.session) {
      setSuccessMessage("Successfully logged in with OTP!");
      localStorage.setItem("lastLoginMethod", "OTP (Verified)");
      router.refresh();
      const redirectPath = getRedirectPath();
      window.location.href = redirectPath;
    } else {
      setError(
        "Invalid OTP or session could not be created. Please try again."
      );
    }
    setLoading(false);
  };

  return (
    <div
      className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        {/* <User className="h-10 w-10 text-primary" /> */}
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-balance text-muted-foreground">
          Sign in or create an account to continue.
        </p>
        {lastLoginMethod && !showOtpInput && (
          <p className="text-sm text-primary mt-1">
            You last logged in using {lastLoginMethod}.
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && !showOtpInput && (
        <Alert
          variant="default"
          className="border-green-500 bg-green-50 text-green-700"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {!showOtpInput ? (
        <>
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
              aria-label="Continue with Google"
            >
              <GoogleIcon /> Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLinkedInLogin}
              disabled={loading}
              aria-label="Continue with LinkedIn"
            >
              <LinkedInIcon /> Continue with LinkedIn
            </Button>
          </div>

          <div className="relative my-2">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
              Or continue with OTP
            </span>
          </div>

          <form onSubmit={handleEmailOtpLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email-otp" className="sr-only">
                Email for OTP
              </Label>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email-otp"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                aria-describedby="email-otp-description"
              />
              <p
                id="email-otp-description"
                className="text-xs text-muted-foreground px-1"
              >
                We'll send a one-time password to your email.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                (TURNSTILE_SITE_KEY !== "1x00000000000000000000AA" &&
                  !captchaToken &&
                  !email.endsWith("@test.com"))
              }
              aria-live="polite"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
            {TURNSTILE_SITE_KEY &&
              TURNSTILE_SITE_KEY !== "1x00000000000000000000AA" && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={setCaptchaToken}
                    ref={captchaRef}
                    options={{ theme: "light" }}
                  />
                </div>
              )}
          </form>
        </>
      ) : (
        <div className="grid gap-4">
          {successMessage && (
            <Alert
              variant="default"
              className="border-green-500 bg-green-50 text-green-700"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>OTP Sent!</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <Label
            htmlFor="otp-input"
            className="text-center text-lg font-medium"
          >
            Enter 6-digit OTP
          </Label>
          <p className="text-center text-sm text-muted-foreground -mt-2">
            Sent to <strong>{email}</strong>
          </p>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={loading}
            name="otp"
            aria-label="One-time password"
          >
            <InputOTPGroup className="mx-auto">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            onClick={handleVerifyOtp}
            className="w-full"
            disabled={loading || otp.length < 6}
            aria-live="polite"
          >
            {loading ? "Verifying..." : "Verify OTP & Login"}
          </Button>
          <Button
            variant="link"
            className="text-sm"
            onClick={() => {
              setShowOtpInput(false);
              setOtp("");
              setError(null);
              setSuccessMessage(null);
            }}
            disabled={loading}
          >
            Use a different email
          </Button>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <a
          href="/terms"
          className="underline hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
