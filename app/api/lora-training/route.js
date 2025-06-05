import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request) {
  const url = `https://api.runpod.ai/v2/${process.env.RUNPOD_TRAINING_ENDPOINT_ID}/run`;

  const requestData = await request.json();

  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("deduct_credits", {
    p_user_id: requestData.user_id,
    p_plan_name: requestData.plan,
    p_credits_required: 1,
  });

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
  if (data === false) {
    return NextResponse.json(
      { error: "Insufficient credits. Please purchase more credits." },
      { status: 400 }
    );
  }

  const inputData = {
    input: {
      lora_file_name: requestData.studioName,
      gender: requestData.gender,
      data_url: requestData.images,
      user_id: requestData.user_id,
      plan_name: requestData.plan,
    },
  };

  const requestConfig = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
    },
    body: JSON.stringify(inputData),
  };

  try {
    const response = await fetch(url, requestConfig);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // data will be like below object.
    // {
    //   "id": "eaebd6e7-6a92-4bb8-a911-f996ac5ea99d",
    //   "status": "IN_QUEUE"
    //   "output": {'lora_url': [], 'user_id': user_id, 'studio_id': studio_id, 'plan_name': plan_name}
    // } and we have to redirect to dashboard/studio/data.id
    const data = await response.json();
    await supabase.from("studio").insert({
      id: data.id,
      creater_id: requestData.user_id,
      plan: requestData.plan,
      organization_id:
        requestData.organization_id === null
          ? null
          : requestData.organization_id,
      name: requestData.studioName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: requestData.images,
      status: "IN_QUEUE",
    });
    if (error) {
      throw new Error(`HTTP error! status: ${error.status}`);
    }

    return NextResponse.redirect(`/dashboard/studio/${data.id}`);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
