"use client";

import { createBrowserClient } from "@supabase/ssr";

export default async function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_PUBLIC
  );
}
