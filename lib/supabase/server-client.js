"use server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import * as Sentry from "@sentry/nextjs";
import { publicEnv } from "../env";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 300; // ms

// Helper function to add delay between retries
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Check if an error is a refresh token error (expected for unauthenticated users)
const isRefreshTokenError = (error) => {
  return (
    error.message?.includes("Invalid Refresh Token") ||
    error.message?.includes("Refresh Token Not Found")
  );
};

const createSupabaseServerClient = async () => {
  const cookieStore = cookies();

  // Try to create the client with retries for resilience
  let retries = 0;
  let lastError = null;

  while (retries < MAX_RETRIES) {
    try {
      // Ensure URL has proper protocol for localhost development
      const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
      const normalizedUrl = supabaseUrl?.startsWith('http') ? supabaseUrl : `http://${supabaseUrl}`;
      
      const client = createServerClient(
        normalizedUrl,
        `${publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        {
          cookies: {
            get(name) {
              try {
                return cookieStore.get(name)?.value;
              } catch (error) {
                console.error("Error getting cookie:", error);
                return undefined;
              }
            },
            set(name, value, options) {
              try {
                cookieStore.set({ name, value, ...options });
              } catch (error) {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                // console.debug(
                //   "Cookie set error (can be ignored in middleware):",
                //   error.message
                // );
              }
            },
            remove(name, options) {
              try {
                cookieStore.set({ name, value: "", ...options });
              } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                // console.debug(
                //   "Cookie remove error (can be ignored in middleware):",
                //   error.message
                // );
              }
            },
          },
          // Add global error handler for Supabase client
          global: {
            fetch: async (url, options) => {
              try {
                const response = await fetch(url, options);
                return response;
              } catch (error) {
                // Only log non-refresh token errors to Sentry
                if (!isRefreshTokenError(error)) {
                  Sentry.captureException(error);
                }
                throw error;
              }
            },
          },
        }
      );

      // Return the successfully created client
      return client;
    } catch (error) {
      lastError = error;
      retries++;

      // Don't retry for refresh token errors as they're expected for unauthenticated users
      if (isRefreshTokenError(error)) {
        console.log(
          "Auth token error (expected for unauthenticated users):",
          error.message
        );
        throw error;
      }

      // Log the error but continue with retries
      console.error(
        `Supabase client creation failed (attempt ${retries}/${MAX_RETRIES}):`,
        error
      );

      if (retries < MAX_RETRIES) {
        // Wait before retrying with exponential backoff
        await sleep(RETRY_DELAY * Math.pow(2, retries - 1));
      }
    }
  }

  // If we've exhausted all retries, log to Sentry and throw
  if (!isRefreshTokenError(lastError)) {
    Sentry.captureException(lastError);
  }

  throw new Error(
    `Failed to create Supabase client after ${MAX_RETRIES} attempts`
  );
};

export default createSupabaseServerClient;
