"use client";

import { useAccountContext } from "@/context/AccountContext";
import { LoadingSkeleton, ErrorMessage } from "@/components/ui/loading";
import StudioCreate from "@/app/dashboard/studio/create/page";
import OrgAdminDashboard from "@/components/dashboard/organizations/OrgAdminDashboard";

interface DashboardClientProps {
  userId: string;
}

export default function DashboardView({ userId }: DashboardClientProps) {
  const {
    selectedContext,
    isLoading: contextLoading,
    isCurrentUserOrgAdmin,
  } = useAccountContext();

  if (contextLoading) {
    return <LoadingSkeleton />;
  }

  if (!selectedContext) {
    return (
      <ErrorMessage message="Error loading account context or no contexts available." />
    );
  }

  // Render based on context type and user role
  if (selectedContext?.type === "personal") {
    return <StudioCreate />;
  }

  if (selectedContext?.type === "organization") {
    return isCurrentUserOrgAdmin ? (
      <OrgAdminDashboard orgContext={selectedContext} />
    ) : (
      <StudioCreate />
    );
  }

  return <ErrorMessage message="Invalid account context selected." />;
}
