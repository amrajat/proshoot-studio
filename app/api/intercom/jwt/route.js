import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { env } from "@/lib/env";

export async function POST() {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Intercom secret from environment
    const intercomSecret = env.INTERCOM_MESSENGER_SECRET;
    if (!intercomSecret) {
      console.error("INTERCOM_MESSENGER_SECRET not configured");
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 }
      );
    }

    // Get user profile and organization data
    const [profileRes, orgMembersRes] = await Promise.allSettled([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("members")
        .select("organizations (id, name)")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle(),
    ]);

    const profile =
      profileRes.status === "fulfilled" ? profileRes.value.data : null;
    const orgMember =
      orgMembersRes.status === "fulfilled" ? orgMembersRes.value.data : null;
    const organization = orgMember?.organizations;

    // Create JWT payload with enhanced user data
    const payload = {
      user_id: user.id,
      email: user.email,
      name: profile?.full_name || user.email?.split("@")[0] || "User",
      created_at: Math.floor(Date.now() / 1000),
      // Add organization data if available
      ...(organization && {
        company: {
          company_id: organization.id,
          name: organization.name,
        },
      }),
    };

    // Generate JWT with 15-minute expiration
    const secret = new TextEncoder().encode(intercomSecret);
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    return NextResponse.json({ jwt });
  } catch (error) {
    console.error("JWT generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
