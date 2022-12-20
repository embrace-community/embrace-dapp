import { useState, useRef, useEffect } from "react";
import { LiveStreamChat } from "./LiveStreamChat";
import Icons from "../../Icons";
import classNames from "classnames";
import { CastSession, Client } from "@livepeer/webrtmp-sdk";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getLiveStream,
  setLiveStream,
} from "../../../store/slices/live-streaming";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

export function LiveStream({ query, space, streamName }) {
  const [copied, setCopied] = useState<boolean>(false);
  const videoEl = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const client = useRef<Client | null>(null);
  const session = useRef<CastSession | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const getLiveStreamSelector = useAppSelector(getLiveStream);
  const liveStream = getLiveStreamSelector(streamName);
  const dispatch = useAppDispatch();
  const { asPath } = useRouter();
  const baseStreamUrl = `${window.location.origin}${asPath}`;

  // useEffect to listen to change in stream (in store)
  // Once set then set the stream to the video element
  useEffect(() => {
    if (
      !liveStream.data ||
      liveStream.status !== "success" ||
      videoEl.current?.srcObject
    ) {
      console.log(
        "Live streaming: session - no data or video element",
        streamName,
        liveStream,
      );
      return;
    }

    const startStream = async () => {
      try {
        client.current = new Client();

        const _stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoEl.current && !videoEl.current.srcObject && liveStream.data) {
          console.log(
            "Live streaming: setting stream to video element",
            _stream,
            liveStream,
          );

          videoEl.current.srcObject = _stream;
          videoEl.current.play();

          session.current = client.current.cast(
            _stream,
            liveStream.data.streamKey,
          );

          setStream(_stream);

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

          console.log(
            "Live streaming: session - saving to store",
            streamName,
            session,
          );
        }
      } catch (err) {
        console.error(`Error: ${err}`);
      }
    };

    startStream();
  }, [liveStream, streamName]);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  const stopCapture = () => {
    if (session.current) {
      session.current.close();
    }

    if (stream && videoEl.current?.srcObject) {
      stream.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
        console.log("Track stopped", track);
      });

      setStream(null);
    }

    if (videoEl.current) {
      videoEl.current.srcObject = null;
    }

    // Save LivePeer stream data to store
    dispatch(
      setLiveStream({
        streamName,
        liveStream: {
          data: null,
          status: null,
        },
      }),
    );
  };

  const toggleMute = () => {
    if (videoEl.current && stream) {
      stream.getTracks().forEach((track) => {
        if (track.kind === "audio") {
          track.enabled = !track.enabled;
          setAudioEnabled(track.enabled);
          console.log("Audio toggled", track);
        }
      });
    }
  };

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

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full flex flex-row justify-center">
          <video ref={videoEl} width="50%" />
        </div>

        <div className="w-full flex flex-row justify-center">
          <button
            onClick={stopCapture}
            className={classNames({
              "rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center m-2":
                true,
            })}
          >
            <Icons.VideoOff className="mr-2" /> End Stream
          </button>

          <button
            onClick={toggleMute}
            className={classNames({
              "rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold p-2 flex flex-row items-center m-2 ml-0":
                true,
            })}
          >
            {audioEnabled ? <Icons.Microphone /> : <Icons.MicrophoneMute />}
          </button>

          <CopyToClipboard
            text={`${baseStreamUrl}?id=${liveStream.data?.playbackId}`}
            onCopy={(e) => setCopied(true)}
          >
            <button
              className={classNames({
                "rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center m-2 ml-0":
                  true,
              })}
            >
              {copied ? (
                <ClipboardDocumentCheckIcon
                  width={24}
                  height={24}
                  className="mr-2"
                />
              ) : (
                <ClipboardDocumentIcon
                  width={24}
                  height={24}
                  className="mr-2"
                />
              )}{" "}
              Copy Link
            </button>
          </CopyToClipboard>
        </div>
      </div>
      <div className="hidden w-1/4 flex-col ml-5 p-2 pt-0">
        <LiveStreamChat />
      </div>
    </>
  );
}
