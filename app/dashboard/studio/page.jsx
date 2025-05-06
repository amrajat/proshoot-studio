import createSupabaseServerClient from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ContentLayout } from "@/components/dashboard/sidebar/content-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, User, Building } from "lucide-react";

export default async function StudioListPage() {
  noStore();
  const supabase = await createSupabaseServerClient();

  // 1. Get User
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login"); // Redirect to login if not authenticated
  }

  // 2. Fetch organizations the user is a member of
  const { data: memberships, error: membershipsError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id);

  if (membershipsError) {
    console.error("Error fetching user memberships:", membershipsError.message);
    // Handle error - maybe show an empty list or an error message
    // For now, continue assuming no org memberships if error occurs
  }
  const memberOrgIds = memberships?.map((m) => m.organization_id) || [];

  // 3. Fetch Studios: Personal OR belonging to member organizations
  let query = supabase
    .from("studios")
    .select(
      `
          id,
          name,
          status,
          created_at,
          creator_user_id,
          organization_id,
          organizations ( name ) 
      `
    )
    // WHERE creator_user_id = user.id OR organization_id IN (memberOrgIds)
    .or(
      `creator_user_id.eq.${user.id},organization_id.in.(${memberOrgIds.join(
        ","
      )})`
    )
    .order("created_at", { ascending: false });

  const { data: studios, error: studiosError } = await query;

  if (studiosError) {
    console.error("Error fetching studios:", studiosError.message);
    // Handle error display appropriately
  }

  return (
    <ContentLayout title="Your Studios">
      <div className="flex justify-end mb-4">
        <Button asChild>
          <Link href="/dashboard/studio/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Studio
          </Link>
        </Button>
      </div>
      {studios && studios.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studios.map((studio) => (
              <TableRow key={studio.id}>
                <TableCell className="font-medium">{studio.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {studio.organization_id ? (
                      <>
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span
                          title={studio.organizations?.name || "Organization"}
                        >
                          {studio.organizations?.name || "Org"}
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Personal</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      studio.status === "completed" ? "default" : "outline"
                    }
                  >
                    {studio.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(studio.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/studio/${studio.id}`}>
                      <Eye className="mr-1 h-4 w-4" /> View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>You haven't created or joined any studios yet.</p>
      )}
    </ContentLayout>
  );
}
