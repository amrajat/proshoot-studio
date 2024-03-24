import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// TODO: UPLOAD THE IMAGES FIRST TO SUPABASE AND THEN RETRIVE THE URL OF IMAGES AND THEN CALL THE ASTRIA API AND CREATE A TUNE AND SAVE THE RESPONSE TO USERS.TABLE FROM SUPABASE.

export async function POST(req, res) {
  const cookieStore = cookies();
  // FIXME: NO NEED TO PASS SUPABASE SECRET KEY HERE.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
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
  const formDataEntryValues = Array.from(formData.values());
  console.log(JSON.stringify(formDataEntryValues));
  let image_urls = [];
  const studioID = uuidv4();
  const age = formData.get("age");
  const gender = formData.get("gender");
  const eye = formData.get("eye");
  const hair = formData.get("hair");
  const name = formData.get("name");
  const ethnicity = formData.get("ethnicity");

  console.log(age, gender, eye, hair, name, ethnicity);

  for (const formDataEntryValue of formDataEntryValues) {
    if (
      typeof formDataEntryValue === "object" &&
      "arrayBuffer" in formDataEntryValue
    ) {
      const file = formDataEntryValue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${"dfac2d1a-50c9-4285-af42-8befbeac0dcf"}/uploaded/${studioID}/${
        uuidv4() + "." + file.type.split("/")[1]
      }`;
      const { error: storageError } = await supabase.storage
        .from("studios")
        .upload(fileName, file);
      console.log(storageError);
      // FIXME: NEED TO GENARATE A SEPARATE UUID FOR EACH STUDIO CREATION USED IN SUPABASE STORAGE UPLOAD AND FILEPATH TOO.
      let imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/studios/${fileName}`;
      image_urls.push(imagePath);
      console.log("image_urls", image_urls);
    }
  }
  // for loop code just above this line.

  // await createTune(image_urls);
  // console.log(result);

  const response2 = await fetch("https://api.astria.ai/tunes", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + `${process.env.ASTRIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tune: {
        title: name + "/" + studioID,
        // Hard coded tune id of Realistic Vision v5.1 from the gallery - https://www.astria.ai/gallery/tunes
        // https://www.astria.ai/gallery/tunes/690204/prompts
        base_tune_id: 690204,
        name: "man",
        branch: "sd15",
        image_urls: image_urls,
      },
    }),
  });
  // TODO: TO VALIDATE THE ASTRIA SUCCESS WE SHOULD CHECK FOR TUNE ID BY result.id if this exists means OK
  const result = await response2.json();
  console.log(result);
  result["poster-image"] = image_urls[0];
  let { data, error } = await supabase.rpc("add_new_studio", {
    new_studio: result,
    user_id: "dfac2d1a-50c9-4285-af42-8befbeac0dcf",
  });

  return NextResponse.json({ success: true });

  // const gender = response.get("gender");
  // const age = response.get("age");
  // const eye = response.get("eye");
  // const hair = response.get("hair");
  // const ethnicity = response.get("ethnicity");

  // console.log("imageList=>", typeof JSON.parse(imageList));

  // for (let i = 0; i < imageList.length; i++) {
  //   console.log(i);
  //   // // FIXME: later pass the user.id from supabase and handle the errors gracefully
  //   // // then update the supabase-url + filename to relavent studio table for astria api calling.

  // }

  // console.log(storageError);

  // const file = req.body.get("file");
  // const firstName = req.body.get("firstName");

  // console.log("file", file);
  // console.log("fname", firstName);
  // console.log(req.body);
  // try {
  //   if (!imageList) {
  //     return NextResponse.json("Error", {
  //       status: 400,
  //       statusText: "File not provided.",
  //     });
  //     // return res.status(400).json({ error: "File not provided" });
  //   }

  // Upload the file to Supabase Storage
  // const { data, error } = await supabase.storage
  //   .from("your-storage-bucket-name") // Replace with your Supabase Storage bucket name
  //   .upload(`/${file.name}`, file.data, {
  //     contentType: file.type,
  //   });

  // if (error) {
  //   console.error("Error uploading file to Supabase Storage:", error);
  //   return res.status(500).json({ error: "Error uploading file" });
  // }

  // Access the file URL from Supabase Storage
  // const fileUrl = data?.Key;

  // Handle the file URL as needed (e.g., save it to a database)

  // Respond with success
  // res.status(200).json({ message: "File uploaded successfully", fileUrl });
  //   return NextResponse.json("Error", {
  //     status: 200,
  //     statusText: "File uploaded successfully.",
  //   });
  // } catch (error) {
  //   return NextResponse.json("Error handling file upload", {
  //     status: 500,
  //     statusText: "Internal Server Error.",
  //   });
  // }
}

//FIXME: THIS IS THE RESPONSE FROM ASTRIA WHEN CREATING A NEW FINETUNE
// IT CAN USEFUL TO STORE THIS IN STUDIO / USERS TABLE IN SUPABASE.

// let { data, error } = await supabase.rpc("add_new_studio", {
//   new_studio: { planName: "Basic", qty: 10 },
//   user_id: id,
// });
