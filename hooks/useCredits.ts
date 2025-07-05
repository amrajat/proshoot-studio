import { useState, useEffect, useCallback } from "react";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import { toast } from "@/hooks/use-toast";
import type { Credits } from "@/types/shared";

export const useCredits = (
  userId: string | null,
  shouldFetch: boolean = true
) => {
  const [credits, setCredits] = useState<Credits | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    const fetchCredits = useCallback(async () => {
    console.log("useCredits: Fetching credits for userId:", userId);
    if (!shouldFetch || !userId) {
      console.log("useCredits: Aborting fetch - shouldFetch is false or no userId.");
      setCredits(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      console.log("useCredits: Supabase client created. Querying credits table...");
      const { data, error: fetchError } = await supabase
        .from("credits")
        .select("*")
        .eq('user_id', userId)
        .maybeSingle();

      console.log("useCredits: Query finished.", { data, fetchError });

      if (fetchError) {
        const errorMessage = `Failed to fetch personal credits: ${fetchError.message}`;
        console.error(errorMessage);
        setError(errorMessage);
        setCredits(null);

        toast({
          title: "Error",
          description: "Failed to load personal credits",
          variant: "destructive",
        });
      } else {
        setCredits(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("Unexpected error fetching personal credits:", err);
      setError(errorMessage);
      setCredits(null);

      toast({
        title: "Error",
        description: "An unexpected error occurred while loading credits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, shouldFetch]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, isLoading, error, refetch: fetchCredits };
};

// Helper function to check if credits have any plan credits
export const hasPlanCredits = (
  credits: Credits | null | undefined
): boolean => {
  if (!credits) return false;
  return credits.starter > 0 || credits.professional > 0 || credits.studio > 0;
};
