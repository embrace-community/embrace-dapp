import { useEffect, useRef, useState } from "react";
import { Client, isSupported } from "@livepeer/webrtmp-sdk";
import classNames from "classnames";
import { Router } from "next/router";
import { Space, SpaceMembership } from "../../../types/space";
import {
  createReactClient,
  LivepeerConfig,
  Player,
  studioProvider,
} from "@livepeer/react";
import { LiveStreamChat } from "./LiveStreamChat";
import Icons from "../../Icons";

// https://docs.livepeer.studio/guides/live/stream-from-the-browser
export default function Streaming({
  query,
  space,
  membership,
}: {
  query: Router["query"];
  space: Space;
  membership: SpaceMembership | undefined;
}) {
  const videoEl = useRef<HTMLVideoElement>(null);
  const playbackId = query.id as string;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const client = useRef<Client | null>(null);
  const session = useRef<any | null>(null);
  const [streamKey, setStreamKey] = useState<string | null>(
    "40aa-g9x7-x4ca-rjf8",
  );

  const livepeerClient = createReactClient({
    provider: studioProvider({
      apiKey: process.env.NEXT_PUBLIC_LIVEPEER_STUDIO_API_KEY,
    }),
  });

  async function startStream() {
    try {
      client.current = new Client();

      setStreamKey(streamKey);

      const _stream = (await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })) as MediaStream;

      if (session.current) {
        session.current.close();
      }

      setStream(_stream);
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
  // async function startCapture(displayMediaOptions) {
  //   try {
  //     client.current = new Client();

  //     const _stream = await navigator.mediaDevices.getDisplayMedia(
  //       displayMediaOptions,
  //     );

  //     if (session.current) {
  //       session.current.close();
  //     }

  //     setStream(_stream);
  //   } catch (err) {
  //     console.error(`Error: ${err}`);
  //   }
  // }

  useEffect(() => {
    if (!stream || !client.current || !streamKey) return;

    session.current = client.current.cast(stream, streamKey);

    if (videoEl.current) {
      videoEl.current.srcObject = stream;
      // For testing purposes, mute the video
      videoEl.current.volume = 0;
      videoEl.current.play();
    }

    session.current.on("open", () => {
      console.log("Stream started.");
      console.log("Stream started; visit Livepeer Dashboard.");
    });

    session.current.on("close", () => {
      console.log("Stream stopped.");
    });

    session.current.on("error", (err) => {
      console.log("Stream error.", err.message);
    });
  }, [streamKey, stream]);

  const stopCapture = () => {
    if (session.current) {
      session.current.close();

      session.current = null;
    }

    if (stream && videoEl.current?.srcObject) {
      stream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
        console.log("Track stopped: ", track);
      });

      setStream(null);
    }

    if (videoEl.current) {
      videoEl.current.srcObject = null;
    }
  };

  if (!isSupported) {
    return <div>WebRTC is not supported in this browser.</div>;
  }

  if (playbackId) {
    return (
      <LivepeerConfig client={livepeerClient}>
        <div className="w-full flex flex-row grow">
          <div className="w-full flex flex-col justify-center">
            <Player
              playbackId={playbackId}
              muted={true}
              objectFit="contain"
              autoPlay={true}
            />
          </div>
          <div className="w-1/5 flex-col ml-5 p-2 pt-0">
            <LiveStreamChat />
          </div>
        </div>
      </LivepeerConfig>
    );
  }

  return (
    <div className="w-full flex flex-row grow">
      {stream && (
        <>
          <div className="w-full flex flex-col justify-center">
            <video
              className={classNames({
                hidden: !stream,
              })}
              ref={videoEl}
            />

            <div className="w-full flex flex-row justify-center">
              <button
                onClick={stopCapture}
                className={classNames({
                  "rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold w-40 py-2 pl-5 pr-6 flex flex-row items-center mt-4":
                    true,
                })}
              >
                <Icons.VideoOff className="mr-2" /> End Stream
              </button>
            </div>
          </div>
          <div className="w-1/5 flex-col ml-5 p-2 pt-0">
            <LiveStreamChat />
          </div>
        </>
      )}

      {!stream && (
        <div className="w-full flex flex-col items-center justify-center">
          <button
            onClick={startStream}
            className={classNames({
              "rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold w-42 py-2 pl-5 pr-6 flex flex-row items-center":
                true,
            })}
          >
            <Icons.Video className="mr-2" /> Start Stream
          </button>
        </div>
      )}

      {/* {<button onClick={startCapture}>Stream Screen</button>} */}
    </div>
  );
}
