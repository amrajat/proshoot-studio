import Replicate from "replicate";
import createSupabaseServerClient from "@/lib/supabase/ServerClient";
import { NextResponse } from "next/server";
import generatePrompts from "@/lib/PROMPTS";

export async function POST(request) {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
  const body = await request.json();
  console.log(body);
  generatePrompts(body);

  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error: sessonError,
  } = await supabase.auth.getSession();

  // FIXME: MAKE SURE THE PLAN EXISTS IN USERS.TABLE: CHECK CREDITS AVAILABILITY
  let {
    data: [{ credits }],
    error: creditsError,
  } = await supabase.from("users").select("credits").eq("id", session.user.id);
  if (credits[body.plan] < 1)
    return NextResponse.json(
      { message: "Not enough credits" },
      { status: 400 }
    );

  // const training = await replicate.trainings.create(
  //   "ostris",
  //   "flux-dev-lora-trainer",
  //   "d995297071a44dcb72244e6c19462111649ec86a9646c32df56daa7f14801944",
  //   {
  //     // You need to create a model on Replicate that will be the destination for the trained version.
  //     destination: "prime-ai-co/headshots",
  //     input: {
  //       steps: 0,
  //       lora_rank: 16,
  //       optimizer: "adamw8bit",
  //       batch_size: 1,
  //       resolution: "512,768,1024",
  //       autocaption: true,
  //       input_images: "https://replicate.yyyyyyyyyy/-Creative.zip",
  //       trigger_word: "TOK",
  //       learning_rate: 0.0004,
  //       wandb_project: "flux_train_replicate",
  //       autocaption_prefix: "a photo of TOK, ",
  //       wandb_save_interval: 100,
  //       caption_dropout_rate: 0.05,
  //       wandb_sample_interval: 100,
  //     },
  //   }
  // );

  // TODO: THIS IS JUST DEMO COPIED FROM REPLICATE CONSOLE.
  const TheResponseFromReplicate = {
    id: "mdshwa55d1rm40chvevv8ttmnr",
    model: "ostris/flux-dev-lora-trainer",
    version: "d995297071a44dcb72244e6c19462111649ec86a9646c32df56daa7f14801944",
    input: {
      autocaption: true,
      autocaption_prefix: "a photo of TOK, ",
      batch_size: 1,
      caption_dropout_rate: 0.05,
      input_images: "https://replicate.yyyyyyyyyy/-Creative.zip",
      learning_rate: 0.0004,
      lora_rank: 16,
      optimizer: "adamw8bit",
      resolution: "512,768,1024",
      steps: 0,
      trigger_word: "TOK",
      wandb_project: "flux_train_replicate",
      wandb_sample_interval: 100,
      wandb_save_interval: 100,
    },
    logs: "",
    output: null,
    data_removed: false,
    error: null,
    status: "starting",
    created_at: "2024-09-10T11:35:31.432Z",
    urls: {
      cancel:
        "https://api.replicate.com/v1/predictions/mdshwa55d1rm40chvevv8ttmnr/cancel",
      get: "https://api.replicate.com/v1/predictions/mdshwa55d1rm40chvevv8ttmnr",
    },
  };

  await supabase.rpc("add_new_studio", {
    new_studio: {
      id: TheResponseFromReplicate.id,
      title: body.profession,
      gender: body.gender,
      coverImage: null,
      created_at: TheResponseFromReplicate.created_at,
      downloaded: false,
      sharing_permission: true,
    },
    user_id: session.user.id,
  });

  // Update the user credits.
  credits[body.plan] = credits[body.plan] - 1;
  if (TheResponseFromReplicate.id) {
    const { data, error } = await supabase
      .from("users")
      .update({ credits: credits })
      .eq("id", session.user.id);
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
