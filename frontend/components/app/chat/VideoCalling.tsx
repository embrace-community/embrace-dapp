import { useEffect, useRef, useState } from "react";

import {
  HuddleClientProvider,
  getHuddleClient,
  useRootStore,
} from "@huddle01/huddle01-client";
import PeerVideoAudioElem from "./PeerVideoAudioElem";

export default function VideoCalling() {
  const huddleClient = getHuddleClient("YOUR_API_KEY");
  const stream = useRootStore((state) => state.stream);
  const enableStream = useRootStore((state) => state.enableStream);
  const pauseTracks = useRootStore((state) => state.pauseTracks);
  const isCamPaused = useRootStore((state) => state.isCamPaused);
  const peers = useRootStore((state) => state.peers);
  const peerId = useRootStore((state) => state.peerId);
  const lobbyPeers = useRootStore((state) => state.lobbyPeers);
  const roomState = useRootStore((state) => state.roomState);
  const micPaused = useRootStore((state) => state.isMicPaused);
  const [allowPeersToAutoJoin, setAllowPeersToAutoJoin] = useState(true);

  const joinCall = async () => {
    const roomId = "embrace.community/space-handle/random-id-stored-in-lit";
    try {
      await huddleClient.join(roomId, {
        address: "0x15900c698ee356E6976e5645394F027F0704c8Eb",
        wallet: "",
        ens: "axit.eth",
      });

      console.log("joined");
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    async function startCall() {
      await enableStream();
      await joinCall();
    }

    startCall();
  }, []);

  useEffect(() => {
    if (allowPeersToAutoJoin) {
      huddleClient.allowAllLobbyPeersToJoinRoom();
    }
  }, [lobbyPeers]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <HuddleClientProvider value={huddleClient}>
      <>
        <div className="grid grid-cols-2">
          <div className="col-span-1">
            {!isCamPaused && (
              <video
                style={{ width: "100%" }}
                ref={videoRef}
                autoPlay
                muted
              ></video>
            )}
            <div>
              {!micPaused && (
                <button onClick={() => huddleClient.muteMic()}>Mute Mic</button>
              )}
              {micPaused && (
                <button onClick={() => huddleClient.unmuteMic()}>
                  unmute Mic
                </button>
              )}
            </div>
          </div>

          <div className="col-span-1">
            <div>
              {Object.values(peers).map((peer) => (
                <PeerVideoAudioElem peerIdAtIndex={peer.peerId} />
              ))}
            </div>
          </div>
        </div>
      </>
    </HuddleClientProvider>
  );
}
