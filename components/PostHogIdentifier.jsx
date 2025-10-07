/**
 * PostHog Identifier Component
 * Automatically identifies users when they're logged in
 * Tracks context switches (personal ↔ organization)
 */

"use client";

import { useEffect, useRef } from "react";
import { useAccountContext } from "@/context/AccountContext";
import { useAnalytics } from "@/lib/analytics";

export const PostHogIdentifier = () => {
  const { userId, selectedContext, profile } = useAccountContext();
  const { identify, setPersonProperties, reset, isReady } = useAnalytics();
  const lastIdentifiedUser = useRef(null);
  const lastIdentifiedContext = useRef(null);

  useEffect(() => {
    if (!isReady || !userId || !profile?.email) return; // Wait for email to be loaded

    const identifyUser = async () => {
      try {
        // Build user properties
        const userProperties = {
          email: profile.email,
          name: profile.full_name,
          signup_date: profile.created_at
        };

        // Check if we need to identify (first time or user changed)
        if (lastIdentifiedUser.current !== userId) {
          identify(userId, userProperties);
          lastIdentifiedUser.current = userId;
          lastIdentifiedContext.current = selectedContext?.id || "personal";
        }
        // Check if context changed (personal ↔ organization switch)
        else if (
          lastIdentifiedContext.current !== (selectedContext?.id || "personal")
        ) {
          setPersonProperties(userProperties);
          lastIdentifiedContext.current = selectedContext?.id || "personal";
        }
      } catch (error) {
      }
    };

    identifyUser();
  }, [
    userId,
    selectedContext,
    profile,
    identify,
    setPersonProperties,
    isReady,
  ]);

  // Reset on logout
  useEffect(() => {
    if (!userId && lastIdentifiedUser.current) {
      reset();
      lastIdentifiedUser.current = null;
      lastIdentifiedContext.current = null;
    }
  }, [userId, reset]);

  return null; // This component doesn't render anything
};
