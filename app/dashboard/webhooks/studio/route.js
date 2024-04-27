import { createServerClient } from "@supabase/ssr";
import { v4 as uuidv4 } from "uuid";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import sharp from "sharp";
import fetch from "node-fetch";
import { Resend } from "resend";
// event= tune `?user_id=${session.user.id}&user_email=${session.user.email}&event=tune&studio_id=${studioID}&secret=${process.env.WEBHOOK_SECRET}`
// event= prompt `?user_id=${session.user.id}&user_email=${session.user.email}&event=prompt&studio_id=${studioID}&secret=${process.env.WEBHOOK_SECRET}`

export async function POST(req, res) {
  const cookieStore = cookies();
  const query = await req.nextUrl.searchParams;
  const user_email = query.get("user_email");
  const user_id = query.get("user_id");
  const event = query.get("event");
  const body = await req.json();
  const studio_id = query.get("studio_id");
  const secret = query.get("secret");

  if (secret !== `${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ success: false }, { status: 200 });
  }

  const supabase = createServerClient(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    `${process.env.SUPABASE_SECRET_KEY}`,
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

  // EVENTS
  const EVENT_STUDIO_READY = "tune";
  const EVENT_PROMPT_READY = "prompt";

  switch (event) {
    // case EVENT_STUDIO_READY:
    //   // if the studio/tune is ready start prompting to the tune object with callback and tune_id
    //   // http://localhost:3000/dashboard/webhooks/studio?user_id=user123&user_email=ablognet@gmail.com&event=tune
    //   // const API_URL = 'https://api.astria.ai/tunes/1/prompts';
    //   // const form = new FormData();
    //   // form.append(
    //   //   "prompt[text]",
    //   //   "a painting of ohwx man in the style of Van Gogh"
    //   // );
    //   // form.append("prompt[negative_prompt]", "old, blemish, wrin");
    //   // form.append("prompt[super_resolution]", true);
    //   // form.append("prompt[face_correct]", true);
    //   // form.append(
    //   //   "prompt[callback]",
    //   //   `https://www.headsshot.com/dashboard/webhooks/studio?user_id=${user_id}&user_email=${user_email}&event=prompt&tune_id=${body.id}&studio_id=${studio_id}`
    //   // );
    //   try {
    //     if (!user_id || !user_email) return;
    //     // Send email to customer
    //     // grab the tune id  retrive all the prompts form astria and put the prompts array object into subabase
    //     //  and and get array of "images" and loop over the arrays and put those images
    //     // into supabase storage with studio and prompt mapping.

    //     const headers = {
    //       Authorization: `Bearer ${process.env.ASTRIA_API_KEY}`,
    //     };
    //     const response = await fetch(
    //       `${process.env.ASTRIA_DOMAIN}/tunes/${body.id}/prompts`,
    //       {
    //         headers: headers,
    //       }
    //     );
    //     prompts = await response.json();

    //     // return Response.json(data);
    //   } catch (error) {
    //     return new NextResponse(
    //       `Studio Webhook Error: ${JSON.stringify(query)}`,
    //       {
    //         status: 500,
    //       }
    //     );
    //   }

    case EVENT_PROMPT_READY:
      const MMYYYYString = `${(new Date().getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${new Date().getFullYear()}`;

      const tune_id = body.tune_id;
      const studio_id = query.get("studio_id");
      const prompt_id = body.id;
      // Change the size of logo and convert this into base64 for less server request.
      const logo = await fetch(`${process.env.URL}/logo/watermark.png`);
      const logoBuffer = await logo.buffer();
      let previewImageArray = [];

      // FOR PREVIEW IMAGES AND WATERMARKING

      body.images.forEach(async (imageURL, index) => {
        console.log("watermarking", index);
        const image = await fetch(imageURL);
        const buffer = await image.buffer();
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
            `${
              MMYYYYString +
              "/" +
              tune_id +
              "/previews/" +
              prompt_id +
              "/" +
              uuidv4()
            }.jpg`,
            watermarkedImage,
            {
              upsert: true,
              contentType: "image/jpg",
            }
          );

        previewImageArray.push(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
            "/storage/v1/object/public/" +
            data.fullPath
        );

        // Only perform this actions on last image item
        if (index === body.images.length - 1) {
          console.log("final index", index);

          // get preview's table data from supabase
          const {
            data: [{ preview }],
            error: perror,
          } = await supabase.from("users").select("preview").eq("id", user_id);

          if (preview[`${tune_id}`]) {
            console.log("tune is listed", preview[`${tune_id}`]);
            const lastPreview = preview[`${tune_id}`]; //Array of urls
            preview[`${tune_id}`] = [...lastPreview, ...previewImageArray];
          }

          if (preview[`${tune_id}`] === undefined) {
            console.log("tune is not listed", preview[`${tune_id}`]);
            preview[`${tune_id}`] = previewImageArray;
          }

          // Finally update the table of previews.
          // Can use resend to inform user about completion of tune and prompt.
          console.log("We are updaing", preview);
          const { data, error } = await supabase
            .from("users")
            .update({ preview: preview })
            .eq("id", user_id)
            .select();
          console.log(data, error);
          if (error) throw new Error(error.message);
        }
      });

      // UPDATE THE REAL IMAGE URLS TO RESULTS COLUMN

      // get results's table data from supabase
      let imageUrls = body.images;

      Promise.all(
        imageUrls.map(async (url, index) => {
          const response = await fetch(url);
          imageUrls[index] = response.url;
        })
      );

      const {
        data: [{ results }],
        error: resultsError,
      } = await supabase.from("users").select("results").eq("id", user_id);

      if (results[`${tune_id}`]) {
        const lastResults = results[`${tune_id}`]; //Array of urls
        results[`${tune_id}`] = [...lastResults, ...imageUrls];
      }

      if (results[`${tune_id}`] === undefined) {
        results[`${tune_id}`] = imageUrls;
      }

      // Finally update the table of results.
      // Can use resend to inform user about completion of tune and prompt.
      console.log("We are updaing", results);
      const { data, error } = await supabase
        .from("users")
        .update({ results: results })
        .eq("id", user_id)
        .select();
      console.log(data, error);
      if (error) throw new Error(error.message);

      return NextResponse.json({ success: true }, { status: 200 });

    default:
      return NextResponse.json({ success: false }, { status: 500 });
  }
  return new NextResponse(JSON.stringify(prompts), { status: 200 });
}

//     let { data, error } = await supabase.rpc("add_purchase_history", {
//       transaction_data: transaction_data,
//       user_id: user,
//     });

//     if (!error) {
//       const {
//         data: [{ credits }],
//         error: creditsError,
//       } = await supabase.from("users").select("credits").eq("id", user);

//       if (!creditsError) {
//         credits[plan] = credits[plan] + Number(quantity);
//         const { data: updatedData, error: updateError } = await supabase
//           .from("users")
//           .update({ credits: credits })
//           .eq("id", user);
//       }
//     }

//     return NextResponse.json("Booking successful", {
//       status: 200,
//       statusText: "Booking Successful",
//     });

//   default:
// }
// return NextResponse.json(prompts, { status: 200 });
// return NextResponse.json("Studio Webhook Success", {
//   status: 200,
//   statusText: "Studio Finished Tuning.",
// });
// }
