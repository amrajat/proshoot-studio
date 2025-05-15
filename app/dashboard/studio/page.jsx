import { unstable_noStore as noStore } from "next/cache";
// ContentLayout is now used within StudioListClient, can be removed here if not used otherwise
// import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import StudioListClient from "./components/StudioListClient";

export default async function StudioListPage() {
  noStore(); // Good practice for pages that might host dynamic client components

  // This page no longer fetches data directly.
  // It serves as a host for the client component that handles context and data fetching.

  // If ContentLayout needs a server-defined title that doesn't change with context,
  // it could be here. Otherwise, StudioListClient handles its own title via ContentLayout prop.
  return (
    // <ContentLayout title="Studios"> // Example if a static title was desired from server
    <StudioListClient />
    // </ContentLayout>
  );
}
