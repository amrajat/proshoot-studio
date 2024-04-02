import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getCurrentSession } from "@/lib/supabase/actions/server";
import { PLANS } from "@/lib/data";
import { generateFinalPromptArray } from "@/lib/prompts";

export async function POST(req, res) {
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
  const name = formData.get("name");

  // Prepare formData prompt attributes based on plan selected.
  const finalPrompts = generateFinalPromptArray(formData.get("gender")).slice(
    0,
    PLANS.plan.headshots
  );

  finalPrompts.forEach((promptObject, index) => {
    Object.entries(promptObject).forEach(([key, value]) => {
      formData.append(`tune[prompts_attributes][0][${key}]`, value);
    });
  });

  formData.append("tune[title]", `${name}/${studioID}`);
  // Delete the extra FormData attributes before calling astria api.
  formData.delete("credits");
  formData.delete("plan");
  formData.delete("name");

  const studioCoverImage = formData.getAll("tune[images][]")[0];
  const fileName = `${session.user.id}/cover/${studioID}/${
    uuidv4() + "." + studioCoverImage.type.split("/")[1]
  }`;
  const coverImageURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/studios/${fileName}`;

  const { error: storageError } = await supabase.storage
    .from("studios")
    .upload(fileName, studioCoverImage);

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
  result.coverImage = coverImageURL;

  let updateStudioError;
  if (result.id) {
    let { data, error } = await supabase.rpc("add_new_studio", {
      new_studio: result,
      user_id: session.user.id,
    });
    updateStudioError = error;
  }

  credits[plan] = credits[plan] - 1;
  if (!updateStudioError && result.id) {
    const { data, error } = await supabase
      .from("users")
      .update({ credits: credits })
      .eq("id", session.user.id);
    if (!error) return NextResponse.json({ success: false });
  }

  return NextResponse.json({ success: true });
}

// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = 'https://your-project-url.supabase.co'
// const supabaseKey = 'your-anon-key'
// const bucketName = 'your-bucket-name'

// const supabase = createClient(supabaseUrl, supabaseKey)

// async function uploadFromUrl(url, fileName) {
//   const response = await fetch(url)
//   const buffer = await response.buffer()
//   const { data, error } = await supabase.storage
//     .from(bucketName)
//     .upload(fileName, buffer)
//   if (error) {
//     console.log(error)
//   } else {
//     console.log(data.Key)
//   }
// }

// uploadFromUrl('https://sdbooth2-production.s3.amazonaws.com/6apk82jxhctwt86tnbljc30j9iyk', 'my-image.jpg')
