import { createBrowserClient } from "@supabase/ssr";

const createSupabaseBrowserClient = () => {
  // Use public environment variables directly in client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Supabase configuration missing. Please check your environment variables.`
    );
  }

  // Ensure URL has proper protocol for localhost development
  const normalizedUrl = supabaseUrl.startsWith("http")
    ? supabaseUrl
    : `http://${supabaseUrl}`;

  return createBrowserClient(normalizedUrl, supabaseKey);
};
export default createSupabaseBrowserClient;
