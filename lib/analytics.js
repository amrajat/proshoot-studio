/**
 * Analytics Utilities for PostHog
 * Simplified setup for Web Analytics, Session Replays, and User Identification
 */

"use client";

import { usePostHog } from "posthog-js/react";
import { useIsClient } from "@/hooks/useIsClient";

/**
 * Custom hook for analytics tracking
 * Provides user identification and basic tracking utilities
 */
export const useAnalytics = () => {
  const posthog = usePostHog();
  const isClient = useIsClient();

  /**
   * Identify user with properties from database
   * Call this after login or when user context is available
   * 
   * @param {string} userId - User ID from auth.users
   * @param {Object} properties - User properties
   * @param {string} properties.email - User email from profiles table
   * @param {string} properties.name - User full name from profiles table
   * @param {string} properties.signup_date - User signup date from profiles.created_at
   */
  const identify = (userId, properties = {}) => {
    if (!isClient || !posthog || !userId) return;

    const personProperties = {
      email: properties.email,
      name: properties.full_name,
      signup_date: properties.signup_date,
    };

    // Set person properties directly (PostHog handles $set internally)
    posthog.identify(userId, personProperties);
  };

  /**
   * Update user properties without re-identifying
   * 
   * @param {Object} properties - Properties to update
   */
  const setPersonProperties = (properties) => {
    if (!isClient || !posthog) return;
    posthog.setPersonProperties(properties);
  };

  /**
   * Reset user identification
   * Call this on logout
   */
  const reset = () => {
    if (!isClient || !posthog) return;
    posthog.reset();
  };

  /**
   * Check if PostHog is ready
   */
  const isReady = isClient && !!posthog;

  return {
    identify,
    setPersonProperties,
    reset,
    isReady,
    posthog, // Expose posthog instance for advanced usage
  };
};
