import { isSupported } from "@livepeer/webrtmp-sdk";
import { Router } from "next/router";
import { Space, SpaceMembership } from "../../../types/space";
import {
  createReactClient,
  LivepeerConfig,
  Player,
  studioProvider,
} from "@livepeer/react";
import { LiveStreamChat } from "./LiveStreamChat";
import { LiveStream } from "./LiveStream";
import { InitStream } from "./InitStream";
import { useAppSelector } from "../../../store/hooks";
import { getLiveStream } from "../../../store/slices/live-streaming";

// https://docs.livepeer.studio/guides/live/stream-from-the-browser
export default function LiveStreamIndex({
  query,
  space,
  accountMembership,
}: {
  query: Router["query"];
  space: Space;
  accountMembership: SpaceMembership | undefined;
}) {
  const streamName = `embrace.community/${space.handle}-${space.id}/live-stream`;
  const playbackId = query.id as string;

  const getLiveStreamSelector = useAppSelector(getLiveStream);
  const liveStream = getLiveStreamSelector(streamName);

  const livepeerClient = createReactClient({
    provider: studioProvider({
      apiKey: process.env.NEXT_PUBLIC_LIVEPEER_STUDIO_API_KEY,
    }),
  });

  if (!isSupported) {
    return <div>WebRTC is not supported in this browser.</div>;
  }

  if (playbackId) {
    return (
      <LivepeerConfig client={livepeerClient}>
        <div className="w-full flex flex-row grow items-center justify-center">
          <div className="w-[60%] flex flex-col">
            <Player
              playbackId={playbackId}
              muted={true}
              objectFit="contain"
              autoPlay={true}
            />
          </div>
          <div className="hidden w-1/5 flex-col ml-5 p-2 pt-0">
            <LiveStreamChat />
          </div>
        </div>
      </LivepeerConfig>
    );
  }

  return (
    <LivepeerConfig client={livepeerClient}>
      <div className="w-full flex flex-row grow">
        {liveStream.status === "success" &&
          accountMembership?.isAdmin &&
          accountMembership?.isActive && (
            <LiveStream query={query} space={space} streamName={streamName} />
          )}

        {liveStream.status !== "success" &&
          accountMembership?.isAdmin &&
          accountMembership?.isActive && (
            <InitStream query={query} space={space} streamName={streamName} />
          )}

        {liveStream.status !== "success" &&
          (!accountMembership?.isAdmin || !accountMembership?.isActive) && (
            <div className="w-full flex flex-col items-center mt-10">
              There is currently no Live Stream.
            </div>
          )}

        {/* {<button onClick={startCapture}>Stream Screen</button>} */}
      </div>
    </LivepeerConfig>
  );
}
