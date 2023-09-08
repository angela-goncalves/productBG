"use client";

import Image from "next/image";
import React, { useState } from "react";

export default function Home() {
  const [error, setError] = useState("");
  const [predictionImage, setPredictionImage] = useState("");
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [imageZipUrl, setImageZipUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | undefined>();
  // const [theme, setTheme] = useState<themeType>("Modern");
  // const [room, setRoom] = useState<roomType>("Living Room");
  const baseURL = process.env.VERCEL_URL
    ? "https://" + process.env.VERCEL_URL
    : "http://localhost:3000";

  async function generatePhoto() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoadingPredictions(true);
    const res = await fetch(`${baseURL}/api/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ photo: file, prompt: prompt }),
    });
    console.log("res generated", res);
    let newPhoto = await res.json();
    console.log("newPhoto", newPhoto);
    if (res.status !== 200) {
      setError(newPhoto);
    } else {
      setPredictionImage(newPhoto[0]);
    }
    setTimeout(() => {
      setLoadingPredictions(false);
    }, 1300);
  }
  // console.log("predictionImage", predictionImage);
  async function TrainPhoto() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setLoadingTraining(true);
    const res = await fetch(`${baseURL}/api/training`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageZipUrl: imageZipUrl }),
    });
    console.log("res", res);
    // let newPhoto = await res.json();

    // if (res.status !== 200) {
    //   setError(newPhoto);
    // } else {
    //   setPredictionImage(newPhoto[0]);
    // }
    setTimeout(() => {
      setLoadingTraining(false);
    }, 1300);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h3>you will need a url zip file to train this model</h3>
      <input
        type="text"
        className="w-80 text-black"
        value={imageZipUrl}
        onChange={(e) => setImageZipUrl(e.target.value)}
        placeholder="https://example.com/your-images.zip"
      />
      <button onClick={TrainPhoto}>
        {!loadingTraining ? <h3>submit training</h3> : <h3>wait training</h3>}
      </button>
      <h3>Prompt:</h3>
      <div className="flex">
        <input
          type="text"
          className="w-80 text-black"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="describe your wish image"
        />
        <h3>in style of TOK (this is already added, so dont worry about it)</h3>
      </div>
      <input
        type="file"
        accept="image/jpeg, image/png, image/jpg"
        onChange={(event) => {
          if (event.target.files) {
            console.log("file", event.target.files[0]);
            setFile(event.target.files[0]);
          }
        }}
      />
      <button onClick={generatePhoto}>
        {loadingPredictions ? <h3>wait</h3> : <h3>generate</h3>}
      </button>
      {!loadingPredictions && predictionImage && (
        <Image
          src={predictionImage}
          width={512}
          height={512}
          alt="the image generated"
        />
      )}
    </main>
  );
}
