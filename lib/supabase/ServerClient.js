"use server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import * as Sentry from "@sentry/nextjs";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 300; // ms

// Helper function to add delay between retries
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createSupabaseServerClient = async () => {
  const cookieStore = cookies();

  // Try to create the client with retries for resilience
  let retries = 0;
  let lastError = null;

  while (retries < MAX_RETRIES) {
    try {
      const client = createServerClient(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
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
                console.debug(
                  "Cookie set error (can be ignored in middleware):",
                  error.message
                );
              }
            },
            remove(name, options) {
              try {
                cookieStore.set({ name, value: "", ...options });
              } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
                console.debug(
                  "Cookie remove error (can be ignored in middleware):",
                  error.message
                );
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
                // Log network errors to Sentry
                Sentry.captureException(error);
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
  Sentry.captureException(lastError);
  throw new Error(
    `Failed to create Supabase client after ${MAX_RETRIES} attempts`
  );
};

export default createSupabaseServerClient;
