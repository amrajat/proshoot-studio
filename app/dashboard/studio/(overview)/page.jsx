import { getStudios } from "@/lib/supabase/actions/server";

import Container from "@/components/dashboard/Container";
import StudioCard from "@/components/dashboard/studio/StudioCard";

async function Studio() {
  const studios = await getStudios("dfac2d1a-50c9-4285-af42-8befbeac0dcf");
  return (
    <Container>
      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card */}
        {studios.map((studio) => (
          <StudioCard key={studio.id} studio={studio} />
        ))}
        {/* End Card */}
      </div>
      {/* End Grid */}
    </Container>
  );
}

export default Studio;
