import { jwtVerify } from "jose";

// This helper function is required to convert the hex-encoded JWT secret
// into a format that the 'jose' library can use.
const u8a = (str) =>
  Uint8Array.from(str.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // The worker expects a single 'token' parameter in the URL.
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Missing access token.", { status: 400 });
    }

    // --- 1. Verify the JWT ---
    // This is the security gate. It checks if the token was signed by your
    // Next.js backend, is not expired, and is intended for this worker.
    let payload;
    try {
      // The JWT_SECRET must be set in your worker's environment secrets.
      const secret = u8a(env.JWT_SECRET);
      const { payload: verifiedPayload } = await jwtVerify(token, secret, {
        issuer: "urn:proshoot:issuer",
        audience: "urn:proshoot:audience",
        // Add a 1-minute clock tolerance to account for potential clock skew
        // between the server that creates the token and the worker that verifies it.
        clockTolerance: "1 minute",
      });
      payload = verifiedPayload;
    } catch (err) {
      // If the token is invalid, expired, or tampered with, access is denied.
      console.error("JWT Verification Error:", err.message);
      return new Response("Invalid or expired access token.", { status: 403 });
    }

    // The validated token contains the bucket and file key.
    const { bucket, key } = payload;

    if (!bucket || !key) {
      return new Response("Invalid token payload.", { status: 400 });
    }

    // --- 2. Select the correct R2 Bucket Binding ---
    // It dynamically selects the bucket based on the token's content.
    // e.g., if bucket is "datasets", it looks for env.DATASETS.
    const bucketBinding = env[bucket.toUpperCase()];
    if (!bucketBinding) {
      console.error(`R2 bucket binding not found for bucket: ${bucket}`);
      return new Response("Server configuration error: Bucket not found.", {
        status: 500,
      });
    }

    // --- 3. Stream the file directly from R2 ---
    // This is highly efficient and uses the direct binding to R2.
    try {
      const object = await bucketBinding.get(key);

      if (object === null) {
        return new Response("Object Not Found", { status: 404 });
      }

      // Set the appropriate headers for the response, like content-type.
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);

      // Stream the file's body directly back to the client.
      return new Response(object.body, {
        headers,
      });
    } catch (err) {
      console.error(`Error fetching from R2 bucket '${bucket}':`, err);
      return new Response("Error fetching file.", { status: 500 });
    }
  },
};
