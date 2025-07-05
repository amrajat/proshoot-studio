export type Credits = {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  balance: number;
  starter: number;
  professional: number;
  studio: number;
  team?: number;
};

export type CreditTransferType =
  | "starter"
  | "professional"
  | "studio"
  | "balance"
  | "none";

export type Invitation = {
  id: string;
  organization_id: string;
  invited_email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "expired" | "denied";
  created_at: string;
  transfer_credit_type?: CreditTransferType;
  transfer_credit_amount?: number | null;
};

export type DashboardView = "studio-create" | "organization-admin";
