import { NextResponse } from "next/server";
import {
  getCurrentSession,
  signOutCurrentUser,
} from "@/lib/supabase/actions/server";
import { redirect } from "next/navigation";

export async function GET(req, res) {
  const { session } = await getCurrentSession();

  if (session) {
    // Sign out the user
    await signOutCurrentUser();
  } else {
    redirect("/auth");
  }
}
