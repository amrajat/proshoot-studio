import { NextResponse } from "next/server";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { SignJWT } from "jose";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

// This helper function is required to convert the hex-encoded JWT secret
// into a format that the 'jose' library can use.
const u8a = (str) =>
  Uint8Array.from(str.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const JWT_SECRET = process.env.R2_PROXY_JWT_SECRET;

export async function POST(req) {
  // --- Environment Variable Validation ---
  if (!JWT_SECRET) {
    console.error("R2 Proxy JWT secret is not configured.");
    return NextResponse.json(
      { error: "Server configuration error: JWT secret is missing." },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();

  try {
    // 1. Authenticate the user to ensure they are logged in.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      // return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // 2. Get the bucket and object key from the request body.
    const { bucket, objectKey, expiresIn } = await req.json();
    if (!bucket || !objectKey) {
      return NextResponse.json(
        { error: "Missing 'bucket' or 'objectKey' in request body." },
        { status: 400 }
      );
    }

    // IMPORTANT: You should add authorization logic here.
    // Check if `user.id` is actually allowed to access `objectKey`.
    // This might involve a database lookup. For now, we assume access is granted.

    // 3. Create a short-lived, secure JWT.
    const secret = u8a(JWT_SECRET);
    const token = await new SignJWT({ bucket: bucket, key: objectKey })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("urn:proshoot:issuer")
      .setAudience("urn:proshoot:audience")
      .setExpirationTime(`${expiresIn || 300}s`) // Use requested expiry, or default to 5 minutes
      .setJti(uuidv4()) // Add a unique ID to enforce token uniqueness
      .setIssuedAt() // Explicitly set the 'issued at' time
      .sign(secret);

    // 4. Return the token to the client.
    // The client will use this token to construct the final download URL.
    // Add explicit no-cache headers to prevent Next.js from caching the response.
    return NextResponse.json(
      { token },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error generating download token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
