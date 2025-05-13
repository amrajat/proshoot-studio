"use client";

import { useEffect, useState } from "react";
import createSupabaseBrowserClient from "@/lib/supabase/browser-client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface SentInvitationsListProps {
  organizationId: string;
}

interface Invitation {
  id: string;
  invited_email: string;
  status: "pending" | "accepted" | "expired" | "denied";
  created_at: string;
}

export function SentInvitationsList({
  organizationId,
}: SentInvitationsListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("invitations")
        .select("id, invited_email, status, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invitations:", error);
        setError("Failed to load invitations.");
        setInvitations([]);
      } else {
        setInvitations(data || []);
      }
      setIsLoading(false);
    };

    fetchInvitations();

    // Optional: Set up subscription for real-time updates
    const channel = supabase
      .channel(`invitations:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invitations",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          console.log("Invitation change received!", payload);
          // Refetch data on any change for simplicity
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  const getBadgeVariant = (status: Invitation["status"]) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "accepted":
        return "success"; // Assuming you have a success variant
      case "expired":
        return "outline";
      case "denied":
        return "destructive";
      default:
        return "default";
    }
  };

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of sent invitations.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={`skel-${i}`}>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : invitations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                No invitations sent yet.
              </TableCell>
            </TableRow>
          ) : (
            invitations.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">
                  {invite.invited_email}
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(invite.status)}>
                    {invite.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatDistanceToNow(new Date(invite.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
