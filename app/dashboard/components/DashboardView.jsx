"use client";

import { useAccountContext } from "@/context/AccountContext";
import { LoadingSkeleton, ErrorMessage } from "@/components/ui/loading";
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
    return <LoadingSkeleton />;
  }

  // Handle case where no context is available
  if (!selectedContext) {
    return (
      <ErrorMessage message="Error loading account context or no contexts available." />
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
      return <ErrorMessage message="Invalid account context selected." />;
  }
}
