"use server";

import { SignJWT } from "jose";

/**
 * JWT Image Token Generation Utilities
 * Provides secure token generation for image delivery via Cloudflare Worker
 */

// Convert hex string to Uint8Array (matches worker implementation)
const hexToUint8Array = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

/**
 * Generate a secure JWT token for accessing images via the delivery worker
 * @param {string} imageKey - The R2 object key (e.g., "user123/studio456/image.jpg")
 * @param {string} jwtSecret - Hex-encoded JWT secret (same as worker env)
 * @returns {Promise<string>} - JWT token valid for 1 hour
 */
const generateImageDeliveryToken = async (imageKey, jwtSecret) => {
  if (!imageKey || !jwtSecret) {
    throw new Error("Image key and JWT secret are required");
  }

  try {
    const secret = hexToUint8Array(jwtSecret);

    const token = await new SignJWT({
      key: imageKey, // Only the key is needed, bucket is hardcoded to 'images'
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("urn:proshoot:issuer")
      .setAudience("urn:proshoot:audience")
      .setExpirationTime("1h") // Token valid for 1 hour, reusable
      .sign(secret);

    return token;
  } catch (error) {
    console.error("Failed to generate image delivery token:", error);
    throw new Error("Failed to generate image delivery token");
  }
};

/**
 * Generate secure URLs for multiple images in batch
 * @param {string[]} imageKeys - Array of R2 object keys
 * @param {string} jwtSecret - Hex-encoded JWT secret
 * @param {string} deliveryDomain - Delivery worker domain (e.g., 'delivery.proshoot.co')
 * @returns {Promise<Array<{key: string, secureUrl: string}>>}
 */
export const generateSecureImageUrls = async (
  imageKeys,
  jwtSecret,
  deliveryDomain
) => {
  if (!Array.isArray(imageKeys) || imageKeys.length === 0) {
    return [];
  }

  if (!jwtSecret || !deliveryDomain) {
    throw new Error("JWT secret and delivery domain are required");
  }

  try {
    const urls = await Promise.all(
      imageKeys.map(async (key) => {
        if (!key) return null; // Skip null/undefined keys

        const token = await generateImageDeliveryToken(key, jwtSecret);
        return {
          key,
          secureUrl: `${deliveryDomain}/?token=${token}`,
        };
      })
    );

    // Filter out null results
    return urls.filter(Boolean);
  } catch (error) {
    console.error("Failed to generate secure image URLs:", error);
    throw new Error("Failed to generate secure image URLs");
  }
};

/**
 * Create a single secure image URL
 * @param {string} imageKey - R2 object key
 * @param {string} jwtSecret - Hex-encoded JWT secret
 * @param {string} deliveryDomain - Delivery worker domain
 * @returns {Promise<string>} - Secure image URL
 */
export const createSecureImageUrl = async (
  imageKey,
  jwtSecret,
  deliveryDomain
) => {
  if (!imageKey) {
    return null;
  }

  const token = await generateImageDeliveryToken(imageKey, jwtSecret);
  return `${deliveryDomain}/?token=${token}`;
};
