"use client";

import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  // Redirect if user is already logged in
  // useEffect(() => {
  //   const checkSession = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     if (session) {
  //       router.push("/dashboard");
  //     }
  //   };
  //   checkSession();
  // }, [router, supabase]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Create user if they don't exist
      },
    });

    setIsLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setOtpSent(true);
    setMessage(
      "OTP sent to your email. Please check your inbox (and spam folder)."
    );
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const {
      data: { session },
      error: verifyError,
    } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    setIsLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    if (session) {
      router.push("/dashboard");
    } else {
      // This case should ideally not be reached if verifyError is null and session is null
      // but as a fallback:
      setError("Failed to verify OTP. Please try again or request a new one.");
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setError(null);
    setMessage(null);
    setOtp("");
    // Optionally clear email: setEmail("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {otpSent ? "Verify OTP" : "Welcome"}
          </CardTitle>
          <CardDescription className="text-center">
            {otpSent
              ? `Enter the OTP sent to ${email}`
              : "Enter your email to receive an OTP and log in or sign up."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!otpSent ? (
            <form onSubmit={handleEmailSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text" // Using text to allow for various OTP formats, though "number" or "tel" with pattern could be stricter
                  placeholder="123456"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  inputMode="numeric" // Hint for numeric keyboard on mobile
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          )}
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message &&
            !error && ( // Show general message if no error and message exists
              <p className="text-sm text-center text-green-600">{message}</p>
            )}
        </CardContent>
        {otpSent && (
          <CardFooter className="flex flex-col items-center">
            <Button
              variant="link"
              onClick={handleChangeEmail}
              disabled={isLoading}
              className="text-sm"
            >
              Use a different email
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
