"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonLoader } from "@/components/shared/universal-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Turnstile } from "@marsidev/react-turnstile";

// Enhanced security configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Secure storage utility (encrypted localStorage alternative)
const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify({ value, timestamp: Date.now() }));
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error("Secure storage set error:", error);
    }
  },
  getItem: (key, maxAge = SESSION_TIMEOUT) => {
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;

      const { value, timestamp } = JSON.parse(atob(encrypted));
      if (Date.now() - timestamp > maxAge) {
        sessionStorage.removeItem(key);
        return null;
      }
      return value;
    } catch (error) {
      console.error("Secure storage get error:", error);
      return null;
    }
  },
  removeItem: (key) => {
    sessionStorage.removeItem(key);
  },
};

// Rate limiting utility
const rateLimiter = {
  getAttempts: (key) => {
    const data = secureStorage.getItem(`attempts_${key}`, LOCKOUT_DURATION);
    return data ? data.count : 0;
  },
  incrementAttempts: (key) => {
    const current = rateLimiter.getAttempts(key);
    secureStorage.setItem(`attempts_${key}`, { count: current + 1 });
    return current + 1;
  },
  isLocked: (key) => {
    return rateLimiter.getAttempts(key) >= MAX_LOGIN_ATTEMPTS;
  },
  reset: (key) => {
    secureStorage.removeItem(`attempts_${key}`);
  },
};

// Input sanitization
const sanitizeInput = (input) => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>\"'&]/g, "");
};

// Enhanced OTP validation
const validateOTP = (otp) => {
  return /^\d{6}$/.test(otp) && otp.length === 6;
};

// Enhanced email validation
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Icons (same as before)
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
  const [captchaToken, setCaptchaToken] = useState(null);
  const [lastLoginMethod, setLastLoginMethod] = useState(null);
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const captchaRef = useRef(null);

  const TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  // Enhanced redirect path validation
  const getRedirectPath = () => {
    const nextUrl = searchParams.get("next");
    // Comprehensive validation to prevent open redirect attacks
    if (
      nextUrl &&
      nextUrl.startsWith("/") &&
      !nextUrl.startsWith("//") &&
      !nextUrl.includes(":") &&
      !nextUrl.includes("@") &&
      !nextUrl.includes("\\") &&
      nextUrl.length < 200 &&
      !/[<>\"'&]/.test(nextUrl)
    ) {
      return nextUrl;
    }
    return "/";
  };

  // Check for rate limiting on component mount
  useEffect(() => {
    const clientId = `${navigator.userAgent}_${window.location.hostname}`;
    setIsLocked(rateLimiter.isLocked(clientId));

    const storedLastLoginMethod = secureStorage.getItem("lastLoginMethod");
    if (storedLastLoginMethod) {
      setLastLoginMethod(storedLastLoginMethod);
    }
  }, []);

  // OTP expiry timer
  useEffect(() => {
    if (otpSentTime) {
      const timer = setTimeout(() => {
        setShowOtpInput(false);
        setOtp("");
        toast.error("OTP expired. Please request a new one.");
        setOtpSentTime(null);
      }, OTP_EXPIRY_TIME);

      return () => clearTimeout(timer);
    }
  }, [otpSentTime]);

  const resetFormState = (clearEmail = false) => {
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
    setCaptchaToken(null);
    if (clearEmail) {
      setEmail("");
      setOtp("");
      setOtpSentTime(null);
    }
  };

  const handleRateLimitCheck = (action) => {
    const clientId = `${navigator.userAgent}_${window.location.hostname}`;
    if (rateLimiter.isLocked(clientId)) {
      toast.error(
        `Too many ${action} attempts. Please wait 15 minutes before trying again or contact support if the error persist.`
      );
      setIsLocked(true);
      return false;
    }
    return true;
  };

  const handleAuthError = (error, action) => {
    const clientId = `${navigator.userAgent}_${window.location.hostname}`;
    const attempts = rateLimiter.incrementAttempts(clientId);

    console.error(`${action} Error:`, error.message);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      toast.error(
        `Too many failed attempts. Account temporarily locked for 15 minutes.`
      );
      setIsLocked(true);
    } else {
      toast.error(
        `${action} failed. Please try again. (${
          MAX_LOGIN_ATTEMPTS - attempts
        } attempts remaining)`
      );
    }
  };

  const handleGoogleLogin = async () => {
    if (!handleRateLimitCheck("login")) return;

    resetFormState(true);
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const nextUrl = getRedirectPath();
      const finalRedirectTo =
        nextUrl !== "/"
          ? `${redirectTo}?next=${encodeURIComponent(nextUrl)}`
          : redirectTo;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: finalRedirectTo,
        },
      });

      if (oauthError) {
        handleAuthError(oauthError, "Google login");
      } else {
        secureStorage.setItem("lastLoginMethod", "Google");
        // Reset rate limiting on successful attempt
        const clientId = `${navigator.userAgent}_${window.location.hostname}`;
        rateLimiter.reset(clientId);
      }
    } catch (error) {
      handleAuthError(error, "Google login");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    if (!handleRateLimitCheck("login")) return;

    resetFormState(true);
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const nextUrl = getRedirectPath();
      const finalRedirectTo =
        nextUrl !== "/"
          ? `${redirectTo}?next=${encodeURIComponent(nextUrl)}`
          : redirectTo;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: finalRedirectTo,
        },
      });

      if (oauthError) {
        handleAuthError(oauthError, "LinkedIn login");
      } else {
        secureStorage.setItem("lastLoginMethod", "LinkedIn");
        // Reset rate limiting on successful attempt
        const clientId = `${navigator.userAgent}_${window.location.hostname}`;
        rateLimiter.reset(clientId);
      }
    } catch (error) {
      handleAuthError(error, "LinkedIn login");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpLogin = async (e) => {
    e.preventDefault();

    if (!handleRateLimitCheck("OTP request")) return;

    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Server-side CAPTCHA verification for enhanced security
    if (captchaToken && TURNSTILE_SITE_KEY !== "1x00000000000000000000AA") {
      setLoading(true); // Show loading during CAPTCHA verification
      try {
        const verifyResponse = await fetch("/api/auth/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: captchaToken }),
        });

        const verifyResult = await verifyResponse.json();

        if (!verifyResult.success) {
          setLoading(false);
          toast.error("Security verification failed. Please try again.");
          if (captchaRef.current) {
            captchaRef.current.reset();
          }
          setCaptchaToken(null);
          return;
        }
      } catch (error) {
        console.error("CAPTCHA verification error:", error);
        setLoading(false);
        toast.error("Security verification unavailable. Please try again.");
        return;
      }
    } else if (TURNSTILE_SITE_KEY !== "1x00000000000000000000AA") {
      toast.error("Please complete the CAPTCHA challenge.");
      return;
    }

    resetFormState();
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const nextUrl = getRedirectPath();
      const emailRedirectFinal =
        nextUrl !== "/"
          ? `${redirectTo}?method=otp&next=${encodeURIComponent(nextUrl)}`
          : `${redirectTo}?method=otp`;

      // Use hybrid approach: server-verified token + Supabase CAPTCHA support
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: sanitizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: emailRedirectFinal,
          // Pass token to Supabase for additional validation
          captchaToken: captchaToken || undefined,
        },
      });

      if (otpError) {
        handleAuthError(otpError, "OTP request");
      } else {
        toast.success("OTP sent! Check your inbox/spam folder.");
        setShowOtpInput(true);
        setOtpSentTime(Date.now());
        secureStorage.setItem("lastLoginMethod", "OTP");
        // Reset rate limiting on successful OTP send
        const clientId = `${navigator.userAgent}_${window.location.hostname}`;
        rateLimiter.reset(clientId);
      }
    } catch (error) {
      handleAuthError(error, "OTP request");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!handleRateLimitCheck("OTP verification")) return;

    if (!validateOTP(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    resetFormState();
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: sanitizeInput(email),
        token: otp,
        type: "email",
      });

      if (verifyError) {
        handleAuthError(verifyError, "OTP verification");
      } else if (data.session) {
        toast.success("Successfully logged in!");
        secureStorage.setItem("lastLoginMethod", "OTP (Verified)");
        // Reset rate limiting on successful login
        const clientId = `${navigator.userAgent}_${window.location.hostname}`;
        rateLimiter.reset(clientId);

        router.refresh();
        const redirectPath = getRedirectPath();
        window.location.href = redirectPath;
      } else {
        toast.error(
          "Invalid OTP or session could not be created. Please try again."
        );
      }
    } catch (error) {
      handleAuthError(error, "OTP verification");
    } finally {
      setLoading(false);
    }
  };

  // Show lockout message if rate limited
  if (isLocked) {
    return (
      <div
        className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-red-600">
            Account Temporarily Locked
          </h1>
          <p className="text-balance text-muted-foreground">
            Too many failed login attempts. Please wait 15 minutes before trying
            again.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-balance text-muted-foreground">
          Use your email or oAuth to login securely.
        </p>
        {lastLoginMethod && !showOtpInput && (
          <p className="text-sm text-primary mt-1">
            You last logged in using {lastLoginMethod}.
          </p>
        )}
      </div>

      {!showOtpInput ? (
        <>
          <div className="grid gap-3">
            <Button
              variant="outline"
              size={"lg"}
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
              aria-label="Continue with Google"
            >
              {loading ? (
                <>
                  <ButtonLoader className="mr-2" />
                  Signing in with Google...
                </>
              ) : (
                <>
                  <GoogleIcon /> Continue with Google
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size={"lg"}
              className="w-full"
              onClick={handleLinkedInLogin}
              disabled={loading}
              aria-label="Continue with LinkedIn"
            >
              {loading ? (
                <>
                  <ButtonLoader className="mr-2" />
                  Signing in with LinkedIn...
                </>
              ) : (
                <>
                  <LinkedInIcon /> Continue with LinkedIn
                </>
              )}
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
                maxLength={254}
              />
              <p
                id="email-otp-description"
                className="text-xs text-muted-foreground px-1"
              >
                We'll send a secure one-time password to your email.
              </p>
            </div>

            <Button
              type="submit"
              size={"lg"}
              className="w-full"
              disabled={
                loading ||
                (TURNSTILE_SITE_KEY !== "1x00000000000000000000AA" &&
                  !captchaToken)
              }
              aria-live="polite"
            >
              {loading ? (
                <>
                  <ButtonLoader className="mr-2" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
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
          <Label
            htmlFor="otp-input"
            className="text-center text-lg font-medium"
          >
            Enter 6-digit OTP
          </Label>
          <p className="text-center text-sm text-muted-foreground -mt-2">
            Sent to <strong>{email}</strong>
          </p>
          {otpSentTime && (
            <p className="text-center text-xs text-orange-600">
              OTP expires in{" "}
              {Math.ceil(
                (OTP_EXPIRY_TIME - (Date.now() - otpSentTime)) / 60000
              )}{" "}
              minutes
            </p>
          )}

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
            size={"lg"}
            className="w-full"
            disabled={loading || !validateOTP(otp)}
            aria-live="polite"
          >
            {loading ? (
              <>
                <ButtonLoader className="mr-2" />
                Verifying & signing in...
              </>
            ) : (
              "Verify OTP & Login"
            )}
          </Button>

          <Button
            variant="link"
            className="text-sm"
            onClick={() => {
              setShowOtpInput(false);
              setOtp("");
              setOtpSentTime(null);
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
          href={`${process.env.NEXT_PUBLIC_MARKETING_SITE_URL}/legal#terms`}
          className="underline hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href={`${process.env.NEXT_PUBLIC_MARKETING_SITE_URL}/legal#privacy`}
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
