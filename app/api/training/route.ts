import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { imageZipUrl } = await request.json();

  let response = await fetch(
    "https://api.replicate.com/v1/models/stability-ai/sdxl/versions/d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82/trainings",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY, //change it so the user can user their
      },
      body: JSON.stringify({
        destination: "owner-name/owner-model",
        input: {
          input_images: `${imageZipUrl}`,
          train_batch_size: 1,
          caption_prefix: "In the style of TOK,",
        },
      }),
    }
  );
  // if (response.status === "succeeded") {
  // restoredImage = jsonFinalResponse.output;
  // } else if (response.status === "failed") {
  //   break;
  // } else {
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  // }

  console.log("response", response);
  return NextResponse.json(response);
}
