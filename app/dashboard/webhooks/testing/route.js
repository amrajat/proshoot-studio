import { createServerClient } from "@supabase/ssr";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import sharp from "sharp";
import fetch from "node-fetch";
import * as Sentry from "@sentry/nextjs";
import { validateWebhook } from "replicate";
import config from "@/config";
import generatePrompts from "@/lib/prompts";
import Replicate from "replicate";
import { SendMailClient } from "zeptomail";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const RETRY_LIMIT = 5; // Increased retries
const RETRY_BACKOFF = 1000; // Increased backoff
const REQUEST_TIMEOUT = 600000; // Increased timeout to 10 minutes
const BATCH_SIZE = 4; // Process images in smaller batches

export async function POST(request) {
  const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;

  try {
    // if (!secret) {
    //   return NextResponse.json(
    //     { detail: "Webhook received, but not validated." },
    //     { status: 200 }
    //   );
    // }

    // const webhookIsValid = await validateWebhook(request.clone(), secret);

    const url = process.env.ZOHO_ZEPTOMAIL_URL;
    const token = process.env.ZOHO_ZEPTOMAIL_TOKEN;
    const eMailClient = new SendMailClient({ url, token });

    // if (!webhookIsValid) {
    //   return NextResponse.json(
    //     { detail: "Webhook is invalid" },
    //     { status: 401 }
    //   );
    // }

    const cookieStore = cookies();
    const query = request.nextUrl.searchParams;
    const user_email = query.get("user_email");
    const user_id = query.get("user_id");
    const event = query.get("event");
    const planName = query.get("plan");
    const training_id = query.get("training_id");
    const password = query.get("password");
    const body = await request.text();

    if (password !== "xyz") {
      return NextResponse.json(
        { detail: "Webhook received, but not validated." },
        { status: 200 }
      );
    }

    Sentry.setUser({ email: user_email, id: user_id });
    Sentry.setContext("webhook", {
      event,
      user_id,
      training_id,
      planName,
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    switch (event) {
      case "training":
        const trainingResponse = await JSON.parse(body);
        await handleTrainingEvent(
          trainingResponse,
          user_id,
          user_email,
          planName,
          supabase,
          replicate,
          eMailClient
        );
        break;

      case "prediction":
        const { output: images } = await JSON.parse(body);
        await handlePredictionEvent(images, supabase, user_id, training_id);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid event" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing request", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function handleTrainingEvent(
  trainingResponse,
  user_id,
  user_email,
  planName,
  supabase,
  replicate,
  eMailClient
) {
  try {
    await sendTrainingCompleteEmail(
      eMailClient,
      user_email,
      trainingResponse.id
    );
    const studioAttributes = await getStudioAttributes(
      trainingResponse.id,
      user_id,
      supabase
    );
    const numPrompts = parseInt(config.PLANS[planName].headshots / 4);
    const availablePrompts = generatePrompts(studioAttributes).slice(
      0,
      numPrompts
    );

    // Create predictions sequentially to avoid overwhelming the system
    for (const prompt of availablePrompts) {
      await replicate.predictions.create({
        version: trainingResponse?.output?.version.split(":")[1],
        input: {
          model: "dev",
          prompt,
          extra_lora:
            "https://huggingface.co/XLabs-AI/flux-lora-collection/resolve/main/realism_lora_comfy_converted.safetensors",
          lora_scale: 1,
          num_outputs: 4,
          aspect_ratio: "1:1",
          output_format: "jpg",
          guidance_scale: 3.5,
          output_quality: 100,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 50,
        },
        webhook: `${process.env.URL}/dashboard/webhooks/studio?user_id=${user_id}&user_email=${user_email}&event=prediction&training_id=${trainingResponse.id}`,
        webhook_events_filter: ["completed"],
      });

      // Add delay between predictions
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Failed to handle training event:", error);
    Sentry.captureException(error);
    throw error;
  }
}

async function handlePredictionEvent(images, supabase, user_id, training_id) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("Invalid or empty images array");
  }

  const logoBuffer = await fetchLogoBuffer();
  const results = {
    originals: [],
    watermarked: [],
  };

  // Process images in batches
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    const processedBatch = await Promise.allSettled(
      batch.map(async (imageURL) => {
        try {
          return await processImageWithRetry(
            imageURL,
            logoBuffer,
            supabase,
            training_id
          );
        } catch (error) {
          console.error(`Failed to process image ${imageURL}:`, error);
          Sentry.captureException(error);
          return null;
        }
      })
    );

    // Filter out failed operations and accumulate results
    processedBatch.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        results.originals.push(result.value.original);
        results.watermarked.push(result.value.watermarked);
      }
    });
  }

  // Update database once after all images are processed
  if (results.originals.length > 0) {
    await Promise.all([
      updateUserPreviewsWithRetry(
        user_id,
        training_id,
        results.watermarked,
        supabase,
        true // Add overwrite flag
      ),
      updateResultsColumnWithRetry(
        user_id,
        training_id,
        results.originals,
        supabase,
        true // Add overwrite flag
      ),
    ]);
  }
}

async function processImageWithRetry(
  imageURL,
  logoBuffer,
  supabase,
  training_id,
  retries = RETRY_LIMIT
) {
  for (let i = 0; i < retries; i++) {
    try {
      const imageResponse = await fetchWithRetry(imageURL);
      const buffer = await imageResponse.arrayBuffer();

      const [originalUpload, watermarkedImage] = await Promise.all([
        uploadToSupabaseWithRetry(buffer, supabase, training_id, "results"),
        applyWatermark(buffer, logoBuffer),
      ]);

      const watermarkedUpload = await uploadToSupabaseWithRetry(
        watermarkedImage,
        supabase,
        training_id,
        "previews"
      );

      return {
        original: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${originalUpload.data.fullPath}`,
        watermarked: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${watermarkedUpload.data.fullPath}`,
      };
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_BACKOFF * (i + 1))
      );
    }
  }
}

async function uploadToSupabaseWithRetry(
  imageBuffer,
  supabase,
  training_id,
  type,
  retries = RETRY_LIMIT
) {
  for (let i = 0; i < retries; i++) {
    try {
      const fileName = `${new Date()
        .toISOString()
        .slice(0, 7)}/${training_id}/${type}/${uuidv4()}.jpg`;
      const result = await supabase.storage
        .from("studios")
        .upload(fileName, imageBuffer, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (result.error) throw result.error;
      return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_BACKOFF * (i + 1))
      );
    }
  }
}

async function updateUserPreviewsWithRetry(
  user_id,
  tune_id,
  previewImageArray,
  supabase,
  overwrite = false,
  retries = RETRY_LIMIT
) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: userData, error: perror } = await supabase
        .from("users")
        .select("preview")
        .eq("id", user_id)
        .single();

      if (perror) throw perror;

      const userPreview = userData?.preview || {};
      userPreview[tune_id] = overwrite
        ? previewImageArray
        : [...new Set([...(userPreview[tune_id] || []), ...previewImageArray])];

      const { error: updateError } = await supabase
        .from("users")
        .update({ preview: userPreview })
        .eq("id", user_id);

      if (updateError) throw updateError;
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_BACKOFF * (i + 1))
      );
    }
  }
}

async function updateResultsColumnWithRetry(
  user_id,
  tune_id,
  imageUrls,
  supabase,
  overwrite = false,
  retries = RETRY_LIMIT
) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: userData, error: resultsError } = await supabase
        .from("users")
        .select("results")
        .eq("id", user_id)
        .single();

      if (resultsError) throw resultsError;

      const userResults = userData?.results || {};
      userResults[tune_id] = overwrite
        ? imageUrls
        : [...new Set([...(userResults[tune_id] || []), ...imageUrls])];

      const { error: updateError } = await supabase
        .from("users")
        .update({ results: userResults })
        .eq("id", user_id);

      if (updateError) throw updateError;
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_BACKOFF * (i + 1))
      );
    }
  }
}

// Existing helper functions remain unchanged
async function fetchLogoBuffer() {
  const logoResponse = await fetchWithRetry(
    `${process.env.URL}/logo/watermark.png`
  );
  return await logoResponse.arrayBuffer();
}

async function applyWatermark(imageBuffer, logoBuffer) {
  return await sharp(imageBuffer)
    .composite([
      {
        input: logoBuffer,
        tile: true,
        blend: "over",
        gravity: "northwest",
      },
    ])
    .jpeg({ quality: 75 })
    .toBuffer();
}

async function getStudioAttributes(studioID, user_id, supabase) {
  const { data: [{ studios } = {}] = [], error } = await supabase
    .from("users")
    .select("studios")
    .eq("id", user_id);
  if (error) throw error;
  const studio = studios.find((item) => item.id == studioID);
  if (!studio) throw new Error("Studio not found");
  return studio.attributes;
}

async function fetchWithRetry(
  url,
  options = {},
  retries = RETRY_LIMIT,
  backoff = RETRY_BACKOFF
) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        return response;
      }
      throw new Error(`Fetch failed with status: ${response.status}`);
    } catch (error) {
      if (i === retries - 1 || error.name === "AbortError") {
        console.error("Fetch failed, no more retries", url, error);
        Sentry.captureException(error);
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, backoff * (i + 1)));
    }
  }
}

async function sendTrainingCompleteEmail(eMailClient, user_email, studioID) {
  try {
    await eMailClient.sendMail({
      from: {
        address: "support@proshoot.co",
        name: "Support",
      },
      to: [
        {
          email_address: {
            address: user_email,
            name: "User",
          },
        },
      ],
      subject: "Your Studio is Ready! 🎉",
      htmlbody: `<p>Your Studio is Ready! <a href="https://www.proshoot.co/dashboard/studio/${studioID}">Click here.</a></p>`,
    });
  } catch (error) {
    console.error("Failed to send tune ready email", error);
    Sentry.captureException(error);
    throw error;
  }
}
