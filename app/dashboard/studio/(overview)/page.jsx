import { getCurrentSession, getStudios } from "@/lib/supabase/actions/server";
import Error from "@/components/Error";
import CoverPage from "@/components/dashboard/CoverPage";

import StudioCard from "@/components/dashboard/studio/StudioCard";

async function Studio() {
  let studios;
  try {
    const { session } = await getCurrentSession();
    studios = await getStudios(session.user.id);
  } catch (error) {
    return <Error message="Something went wrong." />;
  }
  if (studios.length < 1) {
    return (
      <CoverPage
        title="No Studio Found."
        buttonText="Buy Studio"
        buttonLink="/studio/buy"
      >
        It appears that you have not made any purchases for a studio or have not
        yet created a studio.
      </CoverPage>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card */}
      {studios.map((studio) => (
        <StudioCard key={studio.id} studio={studio} />
      ))}
      {/* End Card */}
    </div>
  );
}

export default Studio;
