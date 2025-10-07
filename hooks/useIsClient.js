/**
 * useIsClient Hook
 * Prevents hydration mismatches by ensuring code only runs on client
 */

import { useEffect, useState } from "react";

export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};
