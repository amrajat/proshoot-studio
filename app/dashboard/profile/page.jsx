import { getCurrentSession } from "@/lib/supabase/actions/server";

import ProfileUpdateForm from "@/components/dashboard/profile/ProfileUpdateForm";
import Spinner from "@/components/homepage/Spinner";
import Container from "@/components/dashboard/Container";

async function Profile() {
  const { session } = await getCurrentSession();
  if (!session) return <Spinner />;
  return (
    <Container>
      <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-slate-900">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Profile
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your name, password and account settings.
          </p>
        </div>
        <ProfileUpdateForm id={session.user.id} />
      </div>
    </Container>
  );
}

export default Profile;
