"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAccountContext } from "@/context/AccountContext";

const IntercomContext = createContext(undefined);

export const IntercomProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Safely get account context - only use if available
  let userId, selectedContext;
  try {
    const accountContext = useAccountContext();
    userId = accountContext.userId;
    selectedContext = accountContext.selectedContext;
  } catch (error) {
    // Not wrapped in AccountProvider - skip Intercom initialization
    userId = null;
    selectedContext = null;
  }

  // Get Intercom App ID from environment
  const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

  // Generate JWT for secure authentication
  const generateJWT = useCallback(async () => {
    try {
      const response = await fetch("/api/intercom/jwt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data.jwt;
    } catch (error) {
      return null;
    }
  }, []);

  // Load Intercom script and initialize
  useEffect(() => {
    if (!INTERCOM_APP_ID || !userId || isLoaded) {
      return;
    }

    const initIntercom = async () => {
      try {
        // Generate secure JWT
        const userJwt = await generateJWT();
        if (!userJwt) {
          return;
        }

        // Check if script already exists
        if (document.querySelector(`script[src*="widget.intercom.io"]`)) {
          return;
        }

        // Load Intercom script
        const script = document.createElement("script");
        script.src = "https://widget.intercom.io/widget/" + INTERCOM_APP_ID;
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
          // Initialize Intercom with JWT and enhanced user data
          window.Intercom("boot", {
            app_id: INTERCOM_APP_ID,
            intercom_user_jwt: userJwt,
          });

          setIsLoaded(true);
        };

        script.onerror = () => {
          // Script failed to load - fail silently in production
        };
      } catch (error) {
        // Initialization failed - fail silently in production
      }
    };

    initIntercom();

    return () => {
      if (isLoaded && window.Intercom) {
        window.Intercom("shutdown");
        setIsLoaded(false);
      }
    };
  }, [INTERCOM_APP_ID, userId, generateJWT, isLoaded]);

  // Update Intercom when context changes
  useEffect(() => {
    if (isLoaded && userId && selectedContext && window.Intercom) {
      const updateIntercom = async () => {
        try {
          // Generate fresh JWT with updated context
          const userJwt = await generateJWT();
          if (userJwt) {
            window.Intercom("update", {
              intercom_user_jwt: userJwt,
            });
          }
        } catch (error) {
          // Update failed - fail silently
        }
      };

      updateIntercom();
    }
  }, [isLoaded, userId, selectedContext, generateJWT]);

  const contextValue = {
    isLoaded,
  };

  return (
    <IntercomContext.Provider value={contextValue}>
      {children}
    </IntercomContext.Provider>
  );
};

export const useIntercom = () => {
  const context = useContext(IntercomContext);
  if (context === undefined) {
    throw new Error("useIntercom must be used within an IntercomProvider");
  }
  return context;
};
