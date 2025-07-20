import { unstable_noStore as noStore } from "next/cache";
import StudioDetailClient from "../../components/studio/StudioDetailClient";

export default function StudioDetailPage({ params }) {
  noStore();
  const { studio_id: studioId } = params;

  if (!studioId) {
    // This case should ideally be caught by Next.js routing if the folder structure is [studio_id]
    // but as a fallback:
    return (
      <div>
        <p>Studio ID is missing.</p>
      </div>
    );
  }

  return <StudioDetailClient studioId={studioId} />;
}
