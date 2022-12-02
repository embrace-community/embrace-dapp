import React, { Ref, useEffect, useRef } from "react";
import { Client, isSupported } from "@livepeer/webrtmp-sdk";

// https://docs.livepeer.studio/guides/live/stream-from-the-browser
export default function Streaming() {
  const inputEl = useRef<HTMLInputElement>(null);
  const videoEl = useRef<HTMLVideoElement>(null);
  const stream = useRef<any>(null);

  useEffect(() => {
    (async () => {
      if (videoEl.current !== null) {
        videoEl.current.volume = 0;

        stream.current = (await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })) as MediaStream;

        videoEl.current.srcObject = stream.current;
        videoEl?.current?.play();
      }
    })();
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
  async function startCapture(displayMediaOptions) {
    try {
      stream.current = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions
      );

      if (videoEl.current !== null) {
        videoEl.current.srcObject = stream.current;
        videoEl.current.play();
      }
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  const onButtonClick = async () => {
    if (inputEl.current === null) return;

    const streamKey = inputEl.current?.value;

    if (!stream.current) {
      alert("Video stream was not started.");
    }

    if (!streamKey) {
      alert("Invalid streamKey.");
      return;
    }

    const client = new Client();

    const session = client.cast(stream.current, streamKey);

    session.on("open", () => {
      console.log("Stream started.");
      alert("Stream started; visit Livepeer Dashboard.");
    });

    session.on("close", () => {
      console.log("Stream stopped.");
    });

    session.on("error", (err) => {
      console.log("Stream error.", err.message);
    });
  };

  if (!isSupported) {
    return <div>WebRTC is not supported in this browser.</div>;
  }

  return (
    <div className="App">
      <input
        className="App-input"
        ref={inputEl}
        type="text"
        placeholder="streamKey"
      />
      <video className="App-video" ref={videoEl} />
      <button className="App-button" onClick={onButtonClick}>
        Start
      </button>
      <button className="App-button" onClick={startCapture}>
        Enable Screen share
      </button>
    </div>
  );
}
