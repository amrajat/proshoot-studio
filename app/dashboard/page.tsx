import createSupabaseServerClient from "@/lib/supabase/server-client";
import { ContentLayout } from "./components/sidebar/content-layout";
import { redirect } from "next/navigation";
import DashboardView from "./components/DashboardView";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  return (
    <ContentLayout title="Dashboard">
      <DashboardView userId={user.id} />
    </ContentLayout>
  );
}
