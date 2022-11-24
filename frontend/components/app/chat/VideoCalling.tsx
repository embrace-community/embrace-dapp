import { useEffect, useRef, useState } from "react";

import {
  HuddleClientProvider,
  getHuddleClient,
  useRootStore,
} from "@huddle01/huddle01-client";
import PeerVideoAudioElem from "./PeerVideoAudioElem";
import { useAccount } from "wagmi";

export default function VideoCalling({ handle }) {
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
  const account = useAccount();

  const joinCall = async () => {
    // For private / anon spaces then need to create a random room and save it to Ceramic / LIT
    // so that only space members can find the room and join the call
    const roomId = `embrace.community/${handle}`;
    console.log("Joining room", roomId);
    try {
      await enableStream();

      const walletData = {
        address: account.address as string,
        wallet: "",
        ens: "",
      };

      await huddleClient.join(roomId, walletData);
    } catch (error) {
      console.log({ error });
    }
  };

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

  console.log(roomState);

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
              <span>Room state: {roomState.joined.toString()} </span>
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
