import { NextResponse } from "next/server";
import {
  getCurrentSession,
  signOutCurrentUser,
} from "@/lib/supabase/actions/server";
import { redirect } from "next/navigation";

export async function GET(req, res) {
  if (req.method === "GET") {
    const { session } = await getCurrentSession();
    console.log(session);

    if (session) {
      // Sign out the user
      await signOutCurrentUser();
    } else {
      redirect("/auth");
    }
  } else {
    // Handle other HTTP methods
    return NextResponse.json(
      { error: "Method is not allowed." },
      { status: 500 }
    );
  }
}
