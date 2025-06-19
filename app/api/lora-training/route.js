import { NextResponse } from "next/server";
import createSupabaseServerClient from "@/lib/supabase/server-client";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  const supabase = await createSupabaseServerClient();
  const requestData = await request.json();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    // 1. Update 'referred_by' in profiles if applicable
    if (requestData.howDidYouHearAboutUs) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ referred_by: requestData.howDidYouHearAboutUs })
        .eq("id", user.id)
        .is("referred_by", null);
      // TODO: this needs update, it's not working

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Not a critical error, so we just log it and continue.
      }
    }

    const studioId = uuidv4();

    // 2. Create a new entry in public.studios table
    const studioData = {
      id: studioId,
      creator_user_id: user.id,
      organization_id: requestData.organization_id || null,
      name: requestData.studioName,
      status: "pending",
      plan: requestData.plan,
      attributes: {
        gender: requestData.gender,
        age: requestData.age,
        ethnicity: requestData.ethnicity,
        hairstyle: requestData.hairStyle,
        eyecolor: requestData.eyeColor,
        glasses: requestData.glasses,
      },
      attire_ids: requestData.clothing.map((c) => c.name),
      background_ids: requestData.backgrounds.map((b) => b.name),
      datasets:
        "https://ai-studio-datasets.s3.us-east-1.amazonaws.com/datasets/1.zip", // Expects a single URL string
    };

    const { error: studioError } = await supabase
      .from("studios")
      .insert(studioData);

    if (studioError) {
      console.error("Error creating studio:", studioError);
      return NextResponse.json(
        { error: `Error creating studio: ${studioError.message}` },
        { status: 500 }
      );
    }

    // 3. Call the RunPod API
    const runpodApiUrl = `https://api.runpod.ai/v2/${process.env.RUNPOD_LORA_TRAINING_ENDPOINT_ID}/run`;
    const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/lora-training`;

    const runpodInput = {
      input: {
        studio_id: studioId,
        user_id: user.id,
        plan_name: requestData.plan,
        gender: requestData.gender,
        data_url: requestData.images,
        webhook_secret: process.env.RUNPOD_WEBHOOK_SECRET,
      },
      webhook: webhookUrl,
    };

    const runpodRequestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify(runpodInput),
    };

    const runpodResponse = await fetch(runpodApiUrl, runpodRequestConfig);

    if (!runpodResponse.ok) {
      const errorBody = await runpodResponse.text();
      console.error(
        `RunPod API call failed: ${runpodResponse.status} ${errorBody}`
      );
      // Optional: Update studio status to 'failed' here
      return NextResponse.json(
        { error: `RunPod API call failed: ${errorBody}` },
        { status: 502 }
      );
    }

    const runpodData = await runpodResponse.json();
    console.log(runpodData);

    // Optionally, update the studio status with the RunPod job ID
    await supabase
      .from("studios")
      .update({ runpod_job_id: runpodData.id, status: runpodData.status })
      .eq("id", studioId);

    // 4. Return success response with the new studioId
    return NextResponse.json({
      message: "Studio creation initiated successfully!",
      studioId: studioId,
    });
  } catch (error) {
    console.error("Error in /api/lora-training:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
