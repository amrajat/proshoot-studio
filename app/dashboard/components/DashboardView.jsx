"use client";

import { useAccountContext } from "@/context/AccountContext";
import { PageLoader } from "@/components/shared/universal-loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StudioCreate from "@/app/dashboard/studio/create/page";
import OrgAdminDashboard from "@/app/dashboard/components/organizations/OrgAdminDashboard.jsx";

/**
 * Main dashboard view that renders different components based on user context
 * - Personal context: Shows StudioCreate
 * - Organization context: Shows OrgAdminDashboard for owners, StudioCreate for members
 */
export default function DashboardView({ userId }) {
  const {
    selectedContext,
    isLoading: contextLoading,
    isCurrentUserOrgAdmin,
  } = useAccountContext();

  // Show loading state while context is being fetched
  if (contextLoading) {
    return <PageLoader text="Loading dashboard" />;
  }

  // Handle case where no context is available
  if (!selectedContext) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading account context or no contexts available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render based on context type and user permissions
  switch (selectedContext.type) {
    case "personal":
      return <StudioCreate />;

    case "organization":
      return isCurrentUserOrgAdmin ? (
        <OrgAdminDashboard orgContext={selectedContext} />
      ) : (
        <StudioCreate />
      );

    default:
      return (
        <div className="max-w-2xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Invalid account context selected.
            </AlertDescription>
          </Alert>
        </div>
      );
  }
}
