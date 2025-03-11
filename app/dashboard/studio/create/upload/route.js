import Replicate from "replicate";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import createSupabaseServerClient from "@/lib/supabase/ServerClient";
// import { validateStudioData } from "@/lib/validation";
import { updateUserCredits } from "@/lib/credits";

export async function POST(request) {
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      Sentry.captureException(sessionError, {
        contexts: {
          auth: {
            error: "Authentication failed during studio creation",
          },
        },
      });
      return NextResponse.json(
        { message: "Authentication failed. Please log in again." },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      const noSessionError = new Error("No active session found");
      Sentry.captureException(noSessionError, {
        contexts: {
          auth: {
            error: "No session during studio creation",
          },
        },
      });
      return NextResponse.json(
        { message: "No active session. Please log in again." },
        { status: 401 }
      );
    }

    let studioData;
    try {
      studioData = await request.json();
    } catch (parseError) {
      Sentry.captureException(parseError, {
        contexts: {
          request: {
            error: "Failed to parse request body",
          },
        },
      });
      return NextResponse.json(
        { message: "Invalid request format." },
        { status: 400 }
      );
    }

    if (!studioData || studioData.error) {
      return NextResponse.json(
        { message: "We couldn't process your request. Invalid data provided." },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ["plan", "images", "gender", "studioName"];
    const missingFields = requiredFields.filter((field) => !studioData[field]);

    if (missingFields.length > 0) {
      const validationError = new Error(
        `Missing required fields: ${missingFields.join(", ")}`
      );
      Sentry.captureException(validationError, {
        contexts: {
          validation: {
            missingFields,
            studioData: JSON.stringify(studioData),
          },
        },
      });
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const {
      data: { credits },
      error: creditsError,
    } = await supabase
      .from("users")
      .select("credits")
      .eq("id", session.user.id)
      .single();

    if (creditsError) {
      Sentry.captureException(creditsError, {
        contexts: {
          credits: {
            error: "Failed to fetch user credits",
            userId: session.user.id,
          },
        },
      });
      return NextResponse.json(
        { message: "Failed to verify your credits. Please try again." },
        { status: 500 }
      );
    }

    if (!credits || !credits[studioData.plan] || credits[studioData.plan] < 1) {
      return NextResponse.json(
        {
          message:
            "Not enough credits for this plan. Please purchase more credits.",
          currentCredits: credits ? credits[studioData.plan] || 0 : 0,
          requiredCredits: 1,
        },
        { status: 402 }
      );
    }

    try {
      const trainingResponse = await replicate.trainings.create(
        "ostris",
        "flux-dev-lora-trainer",
        "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
        {
          destination: "prime-ai-co/headshots",
          input: {
            steps: 3000,
            lora_rank: 32,
            optimizer: "adamw",
            batch_size: 1,
            resolution: "512,768,1024",
            autocaption: false,
            input_images: studioData.images,
            trigger_word: "JSSPRT",
            learning_rate: 0.0001,
            wandb_project: "flux_train_replicate",
            // autocaption_prefix: `a photo of JSSPRT, `,
            wandb_save_interval: 100,
            caption_dropout_rate: 0.05,
            wandb_sample_interval: 100,
          },
          webhook: `${process.env.URL}/dashboard/webhooks/studio?user_id=${session.user.id}&user_email=${session.user.email}&event=training&plan=${studioData.plan}`,
          webhook_events_filter: ["completed"],
        }
      );

      if (!trainingResponse?.id) {
        throw new Error("Failed to create training on Replicate");
      }

      const { data: newStudioData, error: newStudioError } = await supabase.rpc(
        "add_new_studio",
        {
          new_studio: {
            id: trainingResponse.id,
            title: studioData.studioName
              .replace(/[^a-z0-9]/gi, "")
              .toLowerCase(),
            gender: studioData.gender,
            coverImage: null,
            created_at: trainingResponse.created_at,
            downloaded: false,
            sharing_permission: false,
            attributes: { ...studioData },
          },
          user_id: session.user.id,
        }
      );

      if (newStudioError) {
        throw new Error(`Failed to add new studio: ${newStudioError.message}`);
      }

      await updateUserCredits(supabase, session.user.id, studioData.plan);

      return NextResponse.json(
        { success: true, studioId: trainingResponse.id },
        { status: 200 }
      );
    } catch (processingError) {
      console.error("Error in studio processing:", processingError);
      Sentry.captureException(processingError, {
        contexts: {
          studio: {
            error: "Failed during studio creation process",
            userId: session.user.id,
            plan: studioData.plan,
            gender: studioData.gender,
            imageCount: studioData.images?.length,
          },
        },
      });
      return NextResponse.json(
        {
          message:
            "Failed to create studio. Please try again or contact support.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in studio creation:", error);
    Sentry.captureException(error, {
      contexts: {
        request: {
          url: request.url,
          method: request.method,
        },
      },
    });
    return NextResponse.json(
      { message: "Internal server error. Our team has been notified." },
      { status: 500 }
    );
  }
}
