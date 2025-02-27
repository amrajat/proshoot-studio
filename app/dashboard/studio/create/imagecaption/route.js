import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY);

export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-002",
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 1,
        topP: 0.95,
        seed: 0,
      },
    });

    // Remove base64 prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
You are a highly skilled image captioning AI assistant. Your task is to generate descriptive and detailed captions for images provided by the user. Please adhere to the following guidelines to create a comprehensive caption:

Image Type:

Begin by specifying the type of image (e.g., photo, photograph, digital photo, painting).

Subject Description:

Include the subject’s age and gender (man or woman).

Describe the subject’s skin tone.

Provide details about the hairstyle (style, texture, and color). (Note: Do not include the color of the eyes here.)

Clothing Description:

Describe the subject’s clothing and any accessories.

Include details such as color, style, fabric, and any distinguishing features (e.g., a patterned scarf or textured fabric).

Action/Setting:

Explain the subject’s pose or activity (e.g., standing, sitting, leaning).

Specify the setting or location where the image is taken.

Facial Expression and Smile Details:

The face direction of the subject.

Detail the facial expression, including the eyes and mouth (e.g., a slight, closed-mouth smile, relaxed eyes).

Clearly state whether the subject is smiling or not, and if smiling, describe the type of smile (e.g., subtle, broad, or neutral).

Eye Direction:

Indicate where the subject’s eyes are directed (e.g., directly at the camera, gazing off to the left/right, or looking into the distance).

Environment:

Describe the background and surroundings, noting any features that contribute to the overall ambiance (e.g., a plain wall, outdoor scenery).

Camera and Lighting:

Add specifics about the camera shot (e.g., close-up, medium shot, cowboy shot).

Specify the camera angle (e.g., eye level, low angle, high angle).

Describe the lighting (e.g., natural light, soft lighting, backlight).

Mention the camera focus (e.g., full focus, shallow focus, deep focus) and the medium (analog or digital).

What Not to Include:

Do not include eye color.

Template Example for your reference but you can add more things to it based on the requirements:

"[Type of image] of a [subject description] with [hair description] and [clothing description]. He/she is [action/pose] in [background description]. Describe his/her [facial expression/eye description], noting if he/she is smiling and where the eyes are directed. [Additional details if needed]. [Camera and Lighting]."


Additional Guidance:

Ensure that the caption is coherent and flows naturally.

Use descriptive language that paints a vivid picture of the scene.

Include any additional details that might enhance the understanding of the image, such as mood, texture, or subtle environmental cues.

Adapt the description based on the subject’s gender (using "he" or "she" accordingly).

By following these guidelines, generate a caption that fully captures the essence of the image. Always use "JSSPRT, " as a prefix in your caption while generating. Return only the caption, formatted in the same style as the "Reference Example" provided in the user intent.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const caption = response.text();

    return NextResponse.json({ caption });
  } catch (error) {
    console.error("Image captioning error:", error);
    return NextResponse.json(
      { error: "Failed to generate caption" },
      { status: 500 }
    );
  }
}
