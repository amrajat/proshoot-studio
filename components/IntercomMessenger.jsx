"use client";
import React, { useEffect, useState } from "react";
import Intercom from "@intercom/messenger-js-sdk";
import createSupabaseBrowserClient from "@/lib/supabase/BrowserClient";

// Initialize Supabase client
const supabase = createSupabaseBrowserClient();

export default function IntercomMessenger() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw new Error("Error fetching session: " + error.message);
        }

        if (session) {
          const { user } = session;
          Intercom({
            app_id: "jvwzr8qk",
            user_id: user?.id,
            name: user?.user_metadata?.full_name || "there!",
            email: user?.email,
            created_at: user?.created_at,
          });
        } else {
          Intercom({
            app_id: "jvwzr8qk",
          });
        }
      } catch (error) {
        setErrorMessage(error.message);
        console.error("Intercom initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  return null;
}
