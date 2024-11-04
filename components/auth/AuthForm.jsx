"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  signInWithEmailOTP,
  verifyEmailOTP,
} from "@/lib/supabase/actions/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z
    .string()
    .email("Please use a valid email.")
    .min(1, "Email is required."),
});

const tokenSchema = z.object({
  token: z.string().length(6, "OTP must be 6 digits."),
});

export default function AuthForm({ lastSignedInMethod }) {
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const tokenForm = useForm({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: "",
    },
  });

  async function onEmailSubmit(values) {
    setIsLoading(true);
    try {
      const { data, error } = await signInWithEmailOTP(values.email);
      if (error) throw error;
      setUserEmail(values.email);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the OTP.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onTokenSubmit(values) {
    setIsLoading(true);
    try {
      const { data, error } = await verifyEmailOTP(userEmail, values.token);
      if (error) throw error;
      toast({
        title: "Success",
        description: "You have been successfully logged in.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CardContent className="p-0">
      {!userEmail ? (
        <Form {...emailForm}>
          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-4"
          >
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      {...field}
                      className="h-10 px-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {lastSignedInMethod === "email" && (
              <p className="text-sm text-muted-foreground">Last used method</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Continue with Email"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...tokenForm}>
          <form
            onSubmit={tokenForm.handleSubmit(onTokenSubmit)}
            className="space-y-4"
          >
            <FormField
              control={tokenForm.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-muted-foreground">
              Please enter the 6-digit OTP sent to {userEmail}. Check your spam
              folder if you don't see it.
            </p>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying OTP..." : "Login"}
            </Button>
            <Button
              variant="link"
              className="w-full"
              onClick={() => {
                setUserEmail(null);
                tokenForm.reset();
              }}
              disabled={isLoading}
            >
              Go Back.
            </Button>
          </form>
        </Form>
      )}
    </CardContent>
  );
}
