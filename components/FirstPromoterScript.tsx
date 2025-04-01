"use client";

import Script from "next/script";
import { useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fpr: any;
    FPROM: any;
    _fpr: any;
  }
}

export default function FirstPromoterScript() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const initializeFirstPromoter = useCallback(() => {
    if (window.fpr) {
      // Initialize with referral if present
      window.fpr("init", {
        cid: "vx2r56ks",
      });

      // Track click after initialization
      window.fpr("click");
    }
  }, [ref]);

  useEffect(() => {
    // Initialize FirstPromoter queue
    window.fpr =
      window.fpr ||
      function () {
        (window.fpr.q = window.fpr.q || []).push(arguments);
      };
    window.fpr.q = window.fpr.q || [];

    // Pre-initialize required objects
    window.FPROM = window.FPROM || {};
    window._fpr = window._fpr || {};

    // If the script is already loaded, initialize immediately
    if (typeof window.FPROM.ready !== "undefined") {
      initializeFirstPromoter();
    }
  }, [initializeFirstPromoter]);

  return (
    <>
      <Script id="firstpromoter-inline" strategy="afterInteractive">
        {`
        (function(w){
          // Initialize required objects
          w.FPROM = w.FPROM || {};
          w._fpr = w._fpr || {};
          
          // Initialize queue
          w.fpr = w.fpr || function(){
            (w.fpr.q = w.fpr.q || []).push(arguments);
          };
          w.fpr.q = w.fpr.q || [];
        })(window);
        `}
      </Script>

      <Script
        id="firstpromoter-main"
        src="/api/fp/script"
        strategy="afterInteractive"
        onLoad={initializeFirstPromoter}
      />
    </>
  );
}
