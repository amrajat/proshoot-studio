import {
  RekognitionClient,
  DetectFacesCommand,
  CompareFacesCommand,
} from "@aws-sdk/client-rekognition";
// import { fromTemporaryCredentials } from "@aws-sdk/credential-providers"; // Not strictly needed with manual refresh handling

let rekognitionClient;
let credentialsExpiration;

// Ensure this is available client-side. Can be set in .env.local as NEXT_PUBLIC_AWS_REGION
const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";

// --- Credential Management ---
async function fetchTemporaryCredentials() {
  try {
    const response = await fetch("/api/sts-credentials");
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch temporary credentials: ${
          response.status
        } ${JSON.stringify(errorData)}`
      );
    }
    const creds = await response.json();
    if (!creds.accessKeyId || !creds.secretAccessKey || !creds.sessionToken) {
      throw new Error("Incomplete credentials received from STS API.");
    }
    credentialsExpiration = creds.expiration
      ? new Date(creds.expiration)
      : null;
    return creds;
  } catch (error) {
    console.error("Error fetching temporary credentials:", error);
    throw error;
  }
}

async function getRekognitionClient() {
  const now = new Date();
  if (
    !rekognitionClient ||
    !credentialsExpiration ||
    credentialsExpiration.getTime() - now.getTime() < 5 * 60 * 1000
  ) {
    try {
      const tempCredentials = await fetchTemporaryCredentials();
      rekognitionClient = new RekognitionClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: tempCredentials.accessKeyId,
          secretAccessKey: tempCredentials.secretAccessKey,
          sessionToken: tempCredentials.sessionToken,
        },
      });
      console.log("Rekognition client initialized/refreshed.");
    } catch (error) {
      console.error("Failed to initialize/refresh Rekognition client:", error);
      rekognitionClient = null;
      throw error;
    }
  }
  if (!rekognitionClient) {
    throw new Error(
      "Rekognition client is not initialized and could not be created."
    );
  }
  return rekognitionClient;
}

// --- Hashing Utility (Client-Side) ---
export async function calculateImageHash(uint8Array) {
  if (!uint8Array || uint8Array.length === 0) {
    console.warn("Cannot hash empty image data.");
    return null;
  }
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", uint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (error) {
    console.error("Error calculating image hash:", error);
    return null;
  }
}

export async function findExactDuplicatesInBatch(croppedImagesData) {
  const hashes = new Map();
  const imageHashes = await Promise.all(
    croppedImagesData.map(async (imgData) => ({
      id: imgData.id, // Ensure imgData has an 'id'
      hash: await calculateImageHash(imgData.bytes),
    }))
  );

  for (const { id, hash } of imageHashes) {
    if (!hash) continue;
    if (hashes.has(hash)) {
      hashes.get(hash).push(id);
    } else {
      hashes.set(hash, [id]);
    }
  }

  const duplicates = new Map();
  for (const [hash, ids] of hashes.entries()) {
    if (ids.length > 1) {
      duplicates.set(hash, ids);
    }
  }
  return duplicates;
}

// --- Rekognition Analysis Functions ---
export async function analyzeSingleImage(croppedImageBytes, imageDimensions) {
  if (!croppedImageBytes || croppedImageBytes.length === 0) {
    return { error: "No image data provided for analysis.", status: "error" };
  }

  try {
    const client = await getRekognitionClient();
    const command = new DetectFacesCommand({
      Image: { Bytes: croppedImageBytes },
      Attributes: ["ALL"],
    });
    const response = await client.send(command);

    const results = {
      noFaceDetected: false,
      multipleFacesDetected: false,
      isBlurry: null,
      exposure: null,
      faceProximity: null,
      rawResponse: response,
      status: "success",
    };

    if (!response.FaceDetails || response.FaceDetails.length === 0) {
      results.noFaceDetected = true;
      return results;
    }

    if (response.FaceDetails.length > 1) {
      results.multipleFacesDetected = true;
    }

    const face = response.FaceDetails[0];

    if (face.Quality && typeof face.Quality.Sharpness === "number") {
      results.isBlurry = face.Quality.Sharpness < 50;
    }

    if (face.Quality && typeof face.Quality.Brightness === "number") {
      if (face.Quality.Brightness < 30) results.exposure = "underexposed";
      else if (face.Quality.Brightness > 85) results.exposure = "overexposed";
      else results.exposure = "good";
    }

    if (
      face.BoundingBox &&
      imageDimensions &&
      imageDimensions.width &&
      imageDimensions.height
    ) {
      const { Width, Height } = face.BoundingBox;
      const faceArea = Width * Height;
      if (faceArea > 0.6) results.faceProximity = "too_close";
      else if (faceArea < 0.1) results.faceProximity = "too_far";
      else results.faceProximity = "good";
    } else if (face.BoundingBox) {
      console.warn(
        "Image dimensions not provided for proximity calculation. Bounding box data:",
        face.BoundingBox
      );
      results.faceProximity = "unknown_dimensions";
    }
    return results;
  } catch (error) {
    console.error("Error in analyzeSingleImage:", error);
    let errorMessage = `Rekognition API error: ${error.message}`;
    if (error.name === "InvalidParameterException") {
      errorMessage = "Invalid image format or parameters for Rekognition.";
    }
    if (
      error.message.includes("Failed to fetch temporary credentials") ||
      error.message.includes("Rekognition client is not initialized")
    ) {
      errorMessage =
        "Authentication error. Could not connect to analysis service.";
    }
    return { error: errorMessage, rawError: error, status: "error" };
  }
}

export async function findVisuallySimilarInBatch(croppedImagesData) {
  if (!croppedImagesData || croppedImagesData.length < 2) {
    return { similarGroups: [], status: "success_no_comparison" };
  }

  try {
    const client = await getRekognitionClient();
    const adj = new Map();

    for (let i = 0; i < croppedImagesData.length; i++) {
      for (let j = i + 1; j < croppedImagesData.length; j++) {
        const image1 = croppedImagesData[i];
        const image2 = croppedImagesData[j];

        if (
          !image1.bytes ||
          image1.bytes.length === 0 ||
          !image2.bytes ||
          image2.bytes.length === 0
        ) {
          console.warn(
            `Skipping comparison due to missing data for ${image1.id} or ${image2.id}`
          );
          continue;
        }
        if (image1.id === image2.id) continue; // Don't compare an image to itself

        try {
          const command = new CompareFacesCommand({
            SourceImage: { Bytes: image1.bytes },
            TargetImage: { Bytes: image2.bytes },
            SimilarityThreshold: 98.0,
          });
          const response = await client.send(command);

          if (response.FaceMatches && response.FaceMatches.length > 0) {
            // const similarity = response.FaceMatches[0].Similarity;
            if (!adj.has(image1.id)) adj.set(image1.id, new Set());
            if (!adj.has(image2.id)) adj.set(image2.id, new Set());
            adj.get(image1.id).add(image2.id);
            adj.get(image2.id).add(image1.id);
          }
        } catch (error) {
          console.warn(
            `Error comparing faces for ${image1.id} and ${image2.id}:`,
            error.name,
            error.message
          );
        }
      }
    }

    const visited = new Set();
    const finalGroups = [];
    for (const imageId of adj.keys()) {
      if (!visited.has(imageId)) {
        const currentGroup = [];
        const stack = [imageId];
        visited.add(imageId);
        while (stack.length > 0) {
          const u = stack.pop();
          currentGroup.push(u);
          if (adj.has(u)) {
            for (const v of adj.get(u)) {
              if (!visited.has(v)) {
                visited.add(v);
                stack.push(v);
              }
            }
          }
        }
        if (currentGroup.length > 1) {
          finalGroups.push({ ids: currentGroup.sort(), type: "visual" });
        }
      }
    }
    return { similarGroups: finalGroups, status: "success" };
  } catch (error) {
    console.error("Error in findVisuallySimilarInBatch:", error);
    let errorMessage = `Rekognition API error: ${error.message}`;
    if (
      error.message.includes("Failed to fetch temporary credentials") ||
      error.message.includes("Rekognition client is not initialized")
    ) {
      errorMessage =
        "Authentication error. Could not connect to analysis service.";
    }
    return { error: errorMessage, rawError: error, status: "error" };
  }
}

// --- Threshold Notes ---
// Sharpness: < 50 (blurry)
// Brightness: < 30 (underexposed), > 85 (overexposed)
// Face Proximity (BoundingBox area relative to cropped image):
//   - Too Close: > 0.6 (face takes up >60% of image area)
//   - Too Far:   < 0.1 (face takes up <10% of image area)
// CompareFaces SimilarityThreshold: 98.0 (high similarity)
// These are starting points. Adjust based on testing.
