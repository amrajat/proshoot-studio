import { createServerClient } from "@supabase/ssr";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import sharp from "sharp";
import fetch from "node-fetch";
import { Resend } from "resend";
import { performance } from "node:perf_hooks";
import pLimit from "p-limit";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CONCURRENCY_LIMIT = process.env.CONCURRENCY_LIMIT || 10;
const RETRY_LIMIT = process.env.RETRY_LIMIT || 3;
const RETRY_BACKOFF = process.env.RETRY_BACKOFF || 300; // in ms
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT || 5000; // in ms

const limit = pLimit(CONCURRENCY_LIMIT);

export async function POST(req, res) {
  const startTime = performance.now();

  try {
    const cookieStore = cookies();
    const query = req.nextUrl.searchParams;
    const user_email = query.get("user_email");
    const user_id = query.get("user_id");
    const event = query.get("event");
    const text = await req.text();
    const { prompt } = await JSON.parse(text);

    const studio_id = query.get("studio_id");
    const secret = query.get("secret");

    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    Sentry.setUser({ email: user_email, id: user_id });

    const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
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

    const EVENT_TUNE_READY = "tune";
    const EVENT_PROMPT_READY = "prompt";

    switch (event) {
      case EVENT_TUNE_READY:
        const { tune } = await JSON.parse(text);

        await sendTuneReadyEmail(resend, user_email, tune.id);
        break;

      case EVENT_PROMPT_READY:
        await handleImages(prompt, supabase, user_id);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid event" },
          { status: 400 }
        );
    }

    const endTime = performance.now();
    console.log("Time Took: ", endTime - startTime);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing request", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function sendTuneReadyEmail(resend, user_email, tuneId) {
  try {
    await resend.emails.send({
      from: "Support <support@proshoot.co>",
      to: [user_email],
      subject: "Your Studio is Ready! 🎉",
      html: `<p>Your Studio is Ready! <a href="https://www.proshoot.co/dashboard/studio/${tuneId}" >Click here.</a></p>`,
    });
  } catch (error) {
    console.error("Failed to send tune ready email", error);
    throw error;
  }
}

async function handleImages(prompt, supabase, user_id) {
  try {
    const logoResponse = await fetchWithRetry(
      `${process.env.URL}/logo/watermark.png`
    );
    const logoBuffer = await logoResponse.arrayBuffer();
    let previewImageArray = [];

    const promises = prompt.images.map((imageURL, index) =>
      limit(async () => {
        try {
          const imageResponse = await fetchWithRetry(imageURL);
          const buffer = await imageResponse.arrayBuffer();
          const watermarkedImage = await sharp(buffer)
            .composite([
              {
                input: logoBuffer,
                tile: true,
                blend: "over",
                gravity: "northwest",
              },
            ])
            .toFormat("jpg")
            .toBuffer();

          const { data, error } = await supabase.storage
            .from("studios")
            .upload(
              `${new Date().toISOString().slice(0, 7)}/${
                prompt.tune_id
              }/previews/${prompt.id}/${uuidv4()}.jpg`,
              watermarkedImage,
              { upsert: true, contentType: "image/jpg" }
            );

          if (error) throw new Error(error.message);

          previewImageArray.push(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`
          );

          if (index === prompt.images.length - 1) {
            await updateUserPreviews(
              user_id,
              prompt.tune_id,
              previewImageArray,
              supabase
            );
            await updateResultsColumn(
              user_id,
              prompt.tune_id,
              prompt.images,
              supabase
            );
          }
        } catch (error) {
          console.error("Error processing image", imageURL, error);
        }
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Error in handleImages", error);
    throw error;
  }
}

async function updateResultsColumn(user_id, tune_id, imageUrls, supabase) {
  try {
    const fetchedUrls = await Promise.all(
      imageUrls.map(async (url) => {
        const response = await fetch(url);
        return response.url;
      })
    );

    const { data: userData, error: resultsError } = await supabase
      .from("users")
      .select("results")
      .eq("id", user_id);

    if (resultsError) throw new Error(resultsError.message);

    const userResults = userData[0]?.results || {};

    userResults[tune_id] = userResults[tune_id]
      ? [...userResults[tune_id], ...fetchedUrls]
      : fetchedUrls;

    const { data: updateData, error: updateError } = await supabase
      .from("users")
      .update({ results: userResults })
      .eq("id", user_id)
      .select();

    if (updateError) throw new Error(updateError.message);
  } catch (error) {
    console.error("Error updating results column", error);
    throw error;
  }
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
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, backoff * (i + 1)));
    }
  }
}

async function updateUserPreviews(
  user_id,
  tune_id,
  previewImageArray,
  supabase
) {
  try {
    const { data: userData, error: perror } = await supabase
      .from("users")
      .select("preview")
      .eq("id", user_id);
    if (perror) throw new Error(perror.message);

    const userPreview = userData[0]?.preview || {};

    userPreview[tune_id] = userPreview[tune_id]
      ? [...userPreview[tune_id], ...previewImageArray]
      : previewImageArray;

    const { data: updateData, error: updateError } = await supabase
      .from("users")
      .update({ preview: userPreview })
      .eq("id", user_id)
      .select();

    if (updateError) throw new Error(updateError.message);
  } catch (error) {
    console.error("Error updating user previews", error);
    throw error;
  }
}
