import { NextResponse } from "next/server";

const bodyWebhook = {
  event: "training_completed",
  studio: {
    id: "42138d56-5c08-416f-877d-12586a0ca9a3",
    creator_user_id: "ca89573a-387d-49d2-ba64-287efb94bb20",
    organization_id: "511b826b-62ba-42ba-82dd-7d3ed0056a9d",
    name: "Greg",
    status: "COMPLETED",
    provider_id: "pa3mqhrbtdrma0crbbva0nrka0",
    provider: "REPLICATE",
    datasets_object_key: "greg/demo-headshots",
    style_pairs: [
      {
        clothing: {
          name: "black suit with tie",
          theme: "Business Professional",
        },
        background: {
          name: "modern high-rise office with a blurred city skyline",
          theme: "Office",
        },
      },
      {
        clothing: {
          name: "charcoal blazer with light blue shirt",
          theme: "Business Professional",
        },
        background: {
          name: "minimalistic modern office interior",
          theme: "Office",
        },
      },
      {
        clothing: {
          name: "navy suit jacket over white shirt",
          theme: "Business Professional",
        },
        background: {
          name: "modern office with floor-to-ceiling windows, a blurred desk, and indoor potted plants",
          theme: "Office",
        },
      },
      {
        clothing: {
          name: "three-piece suit in navy",
          theme: "Business Professional",
        },
        background: {
          name: "corporate office with large windows and a blurred city skyline",
          theme: "Office",
        },
      },
      {
        clothing: {
          name: "dark gray blazer with white shirt",
          theme: "Business Professional",
        },
        background: {
          name: "modern office featuring glass windows and desks",
          theme: "Business Professional",
        },
      },
    ],
    user_attributes: {
      age: "mid-20s",
      gender: "woman",
      ethnicity: "caucasian",
    },
    started_at: "2025-07-30T19:01:56+00:00",
    completed_at: "2025-07-30T19:02:04+00:00",
    created_at: "2025-07-30T18:59:04+00:00",
    updated_at: "2025-08-01T18:52:31.75564+00:00",
    plan: "STARTER",
    weights:
      "ca89573a-387d-49d2-ba64-287efb94bb20/42138d56-5c08-416f-877d-12586a0ca9a3/lora.safetensors",
  },
};

export async function POST(request) {
  try {
    const query = request.nextUrl.searchParams;

    const body = await request.text();
    console.log("query", query);
    console.log(body);

    // 4. Return success response with the new studioId
    return NextResponse.json({
      message: "Studio creation initiated successfully!",
    });
  } catch (error) {
    console.error("Error in /api/lora-training:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
