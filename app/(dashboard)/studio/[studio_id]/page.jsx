import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import StudioDetailClient from "../../components/studio/StudioDetailClient";

/**
 * Studio Detail Page
 *
 * Server component that handles authentication and renders the studio detail view
 * Supports both COMPLETED (preview images) and ACCEPTED (favorites) status
 */
export default async function StudioDetailPage({ params }) {
  noStore();

  const { studio_id: studioId } = params;

  // Validate studio ID parameter
  if (!studioId) {
    redirect("/studio");
  }

  // Get authenticated user
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth");
  }

  return <StudioDetailClient studioId={studioId} currentUserId={user.id} />;
}
