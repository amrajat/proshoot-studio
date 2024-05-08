import { createServerClient } from "@supabase/ssr";
import { v4 as uuidv4 } from "uuid";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import sharp from "sharp";
import fetch from "node-fetch";
import { Resend } from "resend";

export const maxDuration = 300;

export async function POST(req, res) {
  const cookieStore = cookies();
  const query = await req.nextUrl.searchParams;
  const user_email = query.get("user_email");
  const user_id = query.get("user_id");
  const event = query.get("event");
  const text = await req.text();
  const { prompt } = await JSON.parse(text);
  const studio_id = query.get("studio_id");
  const secret = query.get("secret");

  if (secret !== `${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const resend = new Resend(`${process.env.RESEND_EMAIL_API_KEY}`);

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
  const EVENT_PROMPT_READY = "prompt";

  switch (event) {
    case EVENT_PROMPT_READY:
      const MMYYYYString = `${(new Date().getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${new Date().getFullYear()}`;

      const tune_id = prompt.tune_id;
      // const studio_id = query.get("studio_id");
      const prompt_id = prompt.id;
      // Change the size of logo and convert this into base64 for less server request.
      const logo = await fetch(`${process.env.URL}/logo/watermark.png`);
      const logoBuffer = await logo.arrayBuffer();
      let previewImageArray = [];

      // FOR PREVIEW IMAGES AND WATERMARKING

      prompt.images.forEach(async (imageURL, index) => {
        console.log("watermarking", index);
        const image = await fetch(imageURL);
        const buffer = await image.arrayBuffer();
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
        if (index === prompt.images.length - 1) {
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
      let imageUrls = prompt.images;

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
      console.log("We are updating", results);
      const { data, error } = await supabase
        .from("users")
        .update({ results: results })
        .eq("id", user_id)
        .select();
      console.log(data, error);
      if (error) throw new Error(error.message);

      // Send the email to the customer.
      await resend.emails.send({
        from: "Support <support@proshoot.co>",
        to: [user_email],
        subject: "Your Studio is Ready! 🎉",
        html: `<p>Your Studio is Ready! <a href="https://www.proshoot.co/dashboard/studio/${tune_id}" >Click here.</a></p>`,
      });

      return NextResponse.json({ success: true }, { status: 200 });

    default:
      return NextResponse.json({ success: false }, { status: 500 });
  }
  return new NextResponse({ success: true }, { status: 200 });
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
