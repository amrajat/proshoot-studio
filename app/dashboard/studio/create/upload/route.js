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
      throw new Error("Authentication failed");
    }

    const studioData = await request.json();
    if (studioData.error)
      NextResponse.json(
        { message: "We couldn't process your request." },
        { status: 400 }
      );
    // const validationError = validateStudioData(studioData);
    // if (validationError) {
    //   return NextResponse.json({ message: validationError }, { status: 400 });
    // }

    const {
      data: { credits },
      error: creditsError,
    } = await supabase
      .from("users")
      .select("credits")
      .eq("id", session.user.id)
      .single();

    if (creditsError) {
      throw new Error("Failed to fetch user credits");
    }

    if (credits[studioData.plan] < 1) {
      return NextResponse.json(
        { message: "Not enough credits." },
        { status: 402 }
      );
    }

    const trainingResponse = await replicate.trainings.create(
      "ostris",
      "flux-dev-lora-trainer",
      "d995297071a44dcb72244e6c19462111649ec86a9646c32df56daa7f14801944",
      {
        destination: "prime-ai-co/headshots",
        input: {
          steps: 1000,
          lora_rank: 16,
          optimizer: "adamw8bit",
          batch_size: 1,
          resolution: "512,768,1024",
          autocaption: true,
          input_images: studioData.images,
          trigger_word: "JSSPRT",
          learning_rate: 0.0004,
          wandb_project: "flux_train_replicate",
          autocaption_prefix: `a photo of JSSPRT, `,
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
          title: studioData.studioName.replace(/[^a-z0-9]/gi, "").toLowerCase(),
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
      throw new Error("Failed to add new studio");
    }

    await updateUserCredits(supabase, session.user.id, studioData.plan);

    return NextResponse.json(
      { success: true, studioId: trainingResponse.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in studio creation:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
