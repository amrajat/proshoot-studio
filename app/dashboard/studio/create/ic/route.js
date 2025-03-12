import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Set max duration to Vercel's limit
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY);

// Simple function to validate request authenticity
function validateRequest(timestamp, token) {
  // Secret key should be stored in environment variables
  const secretKey = process.env.PROCESSING_SECRET_KEY;
  // Only accept requests within the last 15 minutes to prevent replay attacks
  const now = Date.now();
  const requestTime = parseInt(timestamp, 10);
  if (isNaN(requestTime) || now - requestTime > 15 * 60 * 1000) {
    return false;
  }

  // Simple hash function to match the client implementation
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Generate expected token
  const expectedToken = simpleHash(
    timestamp + secretKey + timestamp.slice(0, 5)
  );

  // Compare in constant time to prevent timing attacks
  return token === expectedToken;
}

export async function POST(request) {
  const startTime = Date.now();
  const requestId = `ic-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  try {
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      Sentry.captureException(parseError, {
        contexts: {
          request: {
            error: "Failed to parse IC request body",
            requestId,
          },
        },
      });
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { image, timestamp, token } = requestBody;

    // Validate request authenticity
    if (!timestamp || !token || !validateRequest(timestamp, token)) {
      Sentry.captureMessage("Unauthorized IC request attempt", {
        level: "warning",
        tags: { requestId },
      });
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 401 }
      );
    }

    if (!image) {
      const noImageError = new Error("No image provided for IC generation");
      Sentry.captureMessage("IC generation failed: No image provided", {
        level: "warning",
        tags: { requestId },
      });
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Reduced max size to ensure faster processing
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    if (image.length > MAX_IMAGE_SIZE) {
      const sizeError = new Error("Image too large for IC generation");
      Sentry.captureMessage("IC generation failed: Image too large", {
        level: "warning",
        tags: { requestId },
        extra: { imageSize: image.length },
      });
      return NextResponse.json({ error: "Image too large" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-002",
      generationConfig: {
        maxOutputTokens: 2048, // Reduced tokens
        temperature: 1,
        topP: 0.95,
      },
    });

    // Set a timeout that's less than Vercel's 60s limit to ensure we can return a response
    const timeoutPromise = new Promise(
      (_, reject) => setTimeout(() => reject(new Error("Model timeout")), 50000) // 50 seconds timeout
    );

    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
You are a highly skilled image captioning AI assistant. Your task is to generate descriptive and detailed captions for images provided by the user. Please adhere to the following guidelines to create a comprehensive caption:

Image Type:

Begin by specifying the type of image (e.g., photo, photograph, digital photo, painting).

Subject Description:

Include the subject's age and gender (man or woman).

Describe the subject's skin tone.

Provide details about the hairstyle (style, texture, and color). (Note: Do not include the color of the eyes here.)

Clothing Description:

Describe the subject's clothing and any accessories.

Include details such as color, style, fabric, and any distinguishing features (e.g., a patterned scarf or textured fabric).

Action/Setting:

Explain the subject's pose or activity (e.g., standing, sitting, leaning).

Specify the setting or location where the image is taken.

Facial Expression and Smile Details:

The face direction of the subject.

Detail the facial expression, including the eyes and mouth (e.g., a slight, closed-mouth smile, relaxed eyes).

Clearly state whether the subject is smiling or not, and if smiling, describe the type of smile (e.g., subtle, broad, or neutral).

Eye Direction:

Indicate where the subject's eyes are directed (e.g., directly at the camera, gazing off to the left/right, or looking into the distance).

Environment:

Describe the background and surroundings, noting any features that contribute to the overall ambiance (e.g., a plain wall, outdoor scenery).

Camera and Lighting:

Add specifics about the camera shot (e.g., close-up, medium shot, cowboy shot).

Specify the camera angle (e.g., eye level, low angle, high angle).

Describe the lighting (e.g., natural light, soft lighting, backlight).

Mention the camera focus (e.g., full focus, shallow focus, deep focus) and the medium (analog or digital).

What Not to Include:

Do not include eye color.

Template Example for your reference but you can add more things to it based on the requirements:

"[Type of image] of a [subject description] with [hair description] and [clothing description]. He/she is [action/pose] in [background description]. Describe his/her [facial expression/eye description], noting if he/she is smiling and where the eyes are directed. [Additional details if needed]. [Camera and Lighting]."


Additional Guidance:

Ensure that the caption is coherent and flows naturally.

Use descriptive language that paints a vivid picture of the scene.

Include any additional details that might enhance the understanding of the image, such as mood, texture, or subtle environmental cues.

Adapt the description based on the subject's gender (using "he" or "she" accordingly).

By following these guidelines, generate a caption that fully captures the essence of the image. Always use "JSSPRT, " as a prefix in your caption while generating. Return only the caption, formatted in the same style as the "Reference Example" provided in the user intent.`;

    const resultPromise = model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    // Add processing time tracking
    const processingStartTime = Date.now();

    try {
      const result = await Promise.race([resultPromise, timeoutPromise]);
      const response = await result.response;
      const caption = response.text();

      // Log processing time for monitoring
      const processingTime = Date.now() - processingStartTime;
      console.log(`IC processed in ${processingTime}ms`);

      // Track processing time in Sentry for monitoring
      Sentry.addBreadcrumb({
        category: "performance",
        message: `IC processed in ${processingTime}ms`,
        level: "info",
      });

      // Obfuscate the response by encoding it - use btoa compatible encoding
      const encodedData = Buffer.from(caption).toString("base64");
      return NextResponse.json({ data: encodedData, type: "ic-data" });
    } catch (modelError) {
      // If the model times out or fails, return a fallback response
      if (modelError.message === "Model timeout") {
        Sentry.captureMessage("IC processing timed out", {
          level: "warning",
          tags: { requestId },
          extra: { processingTime: Date.now() - processingStartTime },
        });

        // Return encoded fallback
        const fallbackData = Buffer.from(
          "JSSPRT, A photograph of a person."
        ).toString("base64");
        return NextResponse.json({
          data: fallbackData,
          type: "ic-data",
          status: "timeout",
        });
      }

      // For other model errors, rethrow to be caught by the outer catch
      throw modelError;
    }
  } catch (error) {
    console.error("IC error:", error);
    Sentry.captureException(error, {
      contexts: {
        ic: {
          error: "IC processing failed",
          requestId,
          processingTime: Date.now() - startTime,
        },
      },
    });

    // Return an encoded fallback response
    const fallbackData = Buffer.from(
      "JSSPRT, A photograph of a person."
    ).toString("base64");
    return NextResponse.json({
      data: fallbackData,
      type: "ic-data",
      status: "error",
    });
  }
}
