import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getCurrentSession } from "@/lib/supabase/actions/server";
import { PLANS } from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req) {
  const cookieStore = cookies();
  const studioID = uuidv4();

  const { session } = await getCurrentSession();

  const supabase = createServerClient(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
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

  const formData = await req.formData();

  const credits = JSON.parse(formData.get("credits"));
  const plan = formData.get("plan");
  const gender = formData.get("tune[name]");
  const name = formData.get("name");

  // Prepare the formData for Tuning
  formData.append("tune[branch]", `${process.env.TUNE_BRANCH}`);
  formData.append("tune[base_tune_id]", 690204);
  formData.append("tune[token]", "ohwx");
  formData.append("tune[title]", `${name}/${studioID}`);
  formData.append(
    "tune[callback]",
    `${process.env.URL}/dashboard/webhooks/studio?user_id=${session.user.id}&user_email=${session.user.email}&event=tune&studio_id=${studioID}&secret=${process.env.WEBHOOK_SECRET}`
  );

  // New ControlNet Approach
  const controlnetImagesUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/private/controlnet/${gender}/`;
  const numPrompts = Math.trunc(PLANS[plan].headshots / 4);

  function promptObject(gender, index) {
    formData.append(
      `tune[prompts_attributes][${index}][text]`,
      `${
        gender === "man" ? "handsome " : "beautiful "
      }ohwx ${gender} --tiled_upscale`
    );
    formData.append(
      `tune[prompts_attributes][${index}][super_resolution]`,
      true
    );
    formData.append(`tune[prompts_attributes][${index}][inpaint_faces]`, true);
    // formData.append(`tune[prompts_attributes][${index}][hires_fix]`, false);
    formData.append(`tune[prompts_attributes][${index}][face_correct]`, true);
    formData.append(`tune[prompts_attributes][${index}][face_swap]`, true);
    formData.append(
      `tune[prompts_attributes][${index}][input_image_url]`,
      `${controlnetImagesUrl}${gender}-${index + 1}.png`
    );
    formData.append(
      `tune[prompts_attributes][${index}][controlnet_conditioning_scale]`,
      0.4
    );
    formData.append(
      `tune[prompts_attributes][${index}][denoising_strength]`,
      0.5
    );
    formData.append(
      `tune[prompts_attributes][${index}][controlnet_txt2img]`,
      false
    );
    formData.append(`tune[prompts_attributes][${index}][controlnet]`, "pose");
    formData.append(
      `tune[prompts_attributes][${index}][callback]`,
      `${process.env.URL}/dashboard/webhooks/studio?user_id=${session.user.id}&user_email=${session.user.email}&event=prompt&studio_id=${studioID}&secret=${process.env.WEBHOOK_SECRET}`
    );
  }

  for (let step = 0; step < numPrompts; step++) {
    promptObject(gender, step);
  }

  // End New ControlNet Approach

  // Delete the extra FormData attributes
  formData.delete("credits");
  formData.delete("plan");
  formData.delete("name");

  console.log("Studio cover start");

  // const studioCoverImage = formData.getAll("tune[images][]")[0];
  // const fileName = `${session.user.id + "/" + studioID}/covers/${
  //   uuidv4() + "." + studioCoverImage.type.split("/")[1]
  // }`;
  // const coverImageURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/studios/${fileName}`;

  // const { error: storageError } = await supabase.storage
  //   .from("studios")
  //   .upload(fileName, studioCoverImage);

  // if (storageError) console.log("storageError", storageError);
  console.log("Studio cover end");

  // New approach 👇

  let options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + `${process.env.ASTRIA_API_KEY}`,
    },
    body: formData,
  };
  const response = await fetch("https://api.astria.ai/tunes", options);
  const result = await response.json();
  console.log(result);

  let updateStudioError;
  const { id, title, name: studioGender, created_at } = result;
  if (result.id) {
    let { data, error } = await supabase.rpc("add_new_studio", {
      new_studio: {
        id,
        title,
        gender: studioGender,
        coverImage: formData.get("cover"),
        created_at,
        downloaded: false,
      },
      user_id: session.user.id,
    });

    console.log("rpc add_new_studio error", error);

    updateStudioError = error;
  }

  credits[plan] = credits[plan] - 1;
  if (!updateStudioError && result.id) {
    const { data, error } = await supabase
      .from("users")
      .update({ credits: credits })
      .eq("id", session.user.id);

    console.log("updating credits error", error);

    if (error) return NextResponse.json({ success: false }, { status: 200 });
  }

  return NextResponse.json({ success: true, tune_id: id }, { status: 200 });
}
