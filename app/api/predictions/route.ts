// import { Ratelimit } from "@upstash/ratelimit";
// import redis from "../../utils/redis";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Create a new ratelimiter, that allows 5 requests per 24 hours
// const ratelimit = redis
//   ? new Ratelimit({
//       redis: redis,
//       limiter: Ratelimit.fixedWindow(5, "1440 m"),
//       analytics: true,
//     })
//   : undefined;

export async function POST(request: Request) {
  //   // Rate Limiter Code
  //   if (ratelimit) {
  //     const headersList = headers();
  //     const ipIdentifier = headersList.get("x-real-ip");

  //     const result = await ratelimit.limit(ipIdentifier ?? "");

  //     if (!result.success) {
  //       return new Response(
  //         "Too many uploads in 1 day. Please try again in a 24 hours.",
  //         {
  //           status: 429,
  //           headers: {
  //             "X-RateLimit-Limit": result.limit,
  //             "X-RateLimit-Remaining": result.remaining,
  //           } as any,
  //         }
  //       );
  //     }
  //   }

  const { photo, prompt } = await request.json();

  // POST request to Replicate to start the image restoration generation process
  let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Token " + process.env.REPLICATE_API_KEY,
    },
    body: JSON.stringify({
      version:
        "5c540026b11c5ea4679613e0cd46d7a39ee397cd7bb52fbc2b289e3ecec81d5b",
      input: {
        image: photo,
        prompt:
          prompt === "desktop"
            ? "a minimalist desktop in style of TOK"
            : `${prompt.toLowerCase()} in style of TOK`,
        a_prompt:
          "best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning",
        n_prompt:
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
      },
    }),
  });

  let jsonStartResponse = await startResponse.json();
  console.log("jsonStartResponse", jsonStartResponse);
  let endpointUrl = jsonStartResponse.urls.get;

  // GET request to get the status of the image restoration process & return the result when it's ready
  let restoredImage: string | null = null;
  while (!restoredImage) {
    // Loop in 1s intervals until the alt text is ready
    console.log("polling for result...");
    let finalResponse = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
    });

    let jsonFinalResponse = await finalResponse.json();

    if (jsonFinalResponse.status === "succeeded") {
      restoredImage = jsonFinalResponse.output;
      console.log("output", jsonFinalResponse.output);

      console.log(".status", jsonFinalResponse.status);
    } else if (jsonFinalResponse.status === "failed") {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return NextResponse.json(
    restoredImage ? restoredImage : "Failed to restore image"
  );
}
