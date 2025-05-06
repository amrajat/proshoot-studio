import { createServerClient } from "@supabase/ssr";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import sharp from "sharp";
import fetch from "node-fetch";
import { SendMailClient } from "zeptomail";
import pLimit from "p-limit";
import * as Sentry from "@sentry/nextjs";
import { validateWebhook } from "replicate";
import config from "@/config";
import generatePrompts from "@/utils/prompts";
import Replicate from "replicate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CONCURRENCY_LIMIT = 100;
const RETRY_LIMIT = 3;
const RETRY_BACKOFF = 300; // in ms
const REQUEST_TIMEOUT = 300000; // in ms, increased to 10 seconds

const limit = pLimit(CONCURRENCY_LIMIT);

export async function POST(request) {
  const secret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET;
  let eMailClient;

  try {
    // Initialize email client early for error reporting
    const url = process.env.ZOHO_ZEPTOMAIL_URL;
    const token = process.env.ZOHO_ZEPTOMAIL_TOKEN;
    eMailClient = new SendMailClient({ url, token });

    if (!secret) {
      return NextResponse.json(
        { detail: "Webhook received, but not validated." },
        { status: 200 }
      );
    }

    const webhookIsValid = await validateWebhook(request.clone(), secret);

    if (!webhookIsValid) {
      return NextResponse.json(
        { detail: "Webhook is invalid" },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const query = request.nextUrl.searchParams;
    const user_email = query.get("user_email");
    const user_id = query.get("user_id");
    const event = query.get("event");
    const planName = query.get("plan");
    const training_id = query.get("training_id");
    const body = await request.text();

    Sentry.setUser({ email: user_email, id: user_id });

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
        try {
          await generateImagesUsingPrompts(
            trainingResponse,
            user_id,
            user_email,
            planName,
            supabase,
            replicate
          );
          await sendTrainingCompleteEmail(
            eMailClient,
            user_email,
            trainingResponse.id
          );
        } catch (error) {
          throw error;
        }
        break;

      case "prediction":
        const { output: images } = await JSON.parse(body);
        try {
          if (!images) {
            throw new TypeError(
              `Expected 'images' to be defined but got ${images}`
            );
          }
          await handleImages(images, supabase, user_id, training_id);
        } catch (error) {
          break;
        }
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

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function generateImagesUsingPrompts(
  trainingResponse,
  user_id,
  user_email,
  planName,
  supabase,
  replicate
) {
  try {
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
    for (let i = 0; i < availablePrompts.length; i++) {
      await replicate.predictions.create({
        version: trainingResponse?.output?.version.split(":")[1],
        input: {
          model: "dev",
          prompt: availablePrompts[i],
          go_fast: false,
          // extra_lora: "https://huggingface.co/XLabs-AI/flux-RealismLora",
          //   "https://huggingface.co/XLabs-AI/flux-lora-collection/resolve/main/realism_lora_comfy_converted.safetensors",
          lora_scale: 1,
          num_outputs: 4,
          aspect_ratio: "1:1",
          output_format: "jpg",
          guidance_scale: 3.5,
          output_quality: 100,
          prompt_strength: 0.8,
          // extra_lora_scale: 0.25,
          num_inference_steps: 40,
        },
        webhook: `${process.env.URL}/dashboard/webhooks/studio?user_id=${user_id}&user_email=${user_email}&event=prediction&training_id=${trainingResponse.id}`,
        webhook_events_filter: ["completed"],
      });
    }
  } catch (error) {
    console.error("Failed to generate images using prompts.", error);
    Sentry.captureException(error);
    throw error;
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
      htmlbody: `
        <p>Dear User,</p>
        <p>We are excited to let you know that the AI Studio training is now completed. 
        You can access it by clicking the link below:</p>
        <p><a href="https://www.proshoot.co/dashboard/studio/${studioID}" style="color: #007bff; text-decoration: underline;">Access Your Studio</a></p>
        <p>If you still see the message 'Your headshots are being generated,' it may take another 2-4 minutes to complete the process. 
        In case the issue persists, please reach out to our support team for assistance.</p>
        <p>You can email us at <a href="mailto:support@proshoot.co" style="color: #007bff; text-decoration: underline;">support@proshoot.co</a>.</p>
        <p>Best Regards,</p>
        <p><strong>ProShoot, Prime AI Company</strong></p>
      `,
    });
  } catch (error) {
    console.error("Failed to send tune ready email", error);
    Sentry.captureException(error);
    throw error;
  }
}

async function handleImages(images, supabase, user_id, training_id) {
  try {
    const logoBuffer = await fetchLogoBuffer();
    let processedImages = [];

    const promises = images.map((imageURL) =>
      limit(() => processImageDual(imageURL, logoBuffer, supabase, training_id))
    );

    processedImages = await Promise.allSettled(promises);

    const successfulImages = processedImages
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    if (successfulImages.length > 0) {
      await updateUserPreviews(
        user_id,
        training_id,
        successfulImages.map((img) => img.watermarked),
        supabase
      );
      await updateResultsColumn(
        user_id,
        training_id,
        successfulImages.map((img) => img.original),
        supabase
      );
    }

    // Error handling remains the same
  } catch (error) {
    console.error("Error in handleImages", error);
    Sentry.captureException(error);
    throw error;
  }
}

async function fetchLogoBuffer() {
  const logoResponse = await fetchWithRetry(
    `${process.env.URL}/logo/watermark.png`
  );
  return await logoResponse.arrayBuffer();
}

async function processImageDual(imageURL, logoBuffer, supabase, training_id) {
  try {
    const imageResponse = await fetchWithRetry(imageURL);

    const buffer = await imageResponse.arrayBuffer();

    // Process and upload original image
    // const originalImage = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
    const originalUpload = await uploadToSupabase(
      buffer,
      supabase,
      training_id,
      "results"
    );

    // Process and upload watermarked image
    const watermarkedImage = await applyWatermark(buffer, logoBuffer);
    const watermarkedUpload = await uploadToSupabase(
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
    console.error("Error processing image", imageURL, error);
    Sentry.captureException(error);
    throw error;
  }
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
    .jpeg({ quality: 75 }) // Compress the image to reduce file size
    .toBuffer();
}

async function uploadToSupabase(imageBuffer, supabase, training_id, type) {
  const fileName = `${new Date()
    .toISOString()
    .slice(0, 7)}/${training_id}/${type}/${uuidv4()}.jpg`;
  return await supabase.storage
    .from("studios")
    .upload(fileName, imageBuffer, { upsert: true, contentType: "image/jpeg" });
}

async function updateUserPreviews(
  user_id,
  tune_id,
  previewImageArray,
  supabase
) {
  try {
    const { data, error } = await supabase.rpc("append_preview_image_urls", {
      tune_id,
      image_urls: previewImageArray,
      user_id,
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Error updating preview column", error);
    Sentry.captureException(error);
    throw error;
  }
}
async function updateResultsColumn(user_id, tune_id, imageUrls, supabase) {
  try {
    const { data, error } = await supabase.rpc("append_results_image_urls", {
      tune_id,
      image_urls: imageUrls,
      user_id,
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Error updating results column", error);
    Sentry.captureException(error);
    throw error;
  }
}

async function getStudioAttributes(studioID, user_id, supabase) {
  const { data: [{ studios } = {}] = [], error } = await supabase
    .from("users")
    .select("studios")
    .eq("id", user_id);
  if (error) throw new Error(error);
  const studio = studios.find((item) => item.id == studioID);
  if (!studio) throw new Error("Studio not found");
  return studio.attributes; // Return the found studio
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
