import { useEffect, useRef, useState } from "react";

import {
  HuddleClientProvider,
  getHuddleClient,
  useRootStore,
} from "../../../lib/huddle01-client";
import PeerVideoAudioElem from "./PeerVideoAudioElem";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const joinCall = async () => {
    // For private / anon spaces then need to create a random room and save it to Ceramic / LIT
    // so that only space members can find the room and join the call
    const roomId = `embrace.community/${handle}`;
    console.log("Joining room", roomId);
    try {
      await enableStream();

      const walletData = {
        address: account.address as string,
        wallet: account.address as string,
        ens: "",
      };

      await huddleClient.join(roomId, walletData);
    } catch (error) {
      console.log({ error });
    }
  };

  const leaveCall = async () => {
    await huddleClient.close();
  };

  // When there are new lobby peers then auto join the call
  useEffect(() => {
    if (allowPeersToAutoJoin && lobbyPeers.length > 0) {
      try {
        huddleClient.allowAllLobbyPeersToJoinRoom();
      } catch (error) {
        console.log({ error });
      }
    }
  }, [allowPeersToAutoJoin, huddleClient, lobbyPeers]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      console.log("set video");
    }

    console.log("Stream", stream);
    console.log("Roomstate", roomState);
    console.log("Peers", peers);
  }, [stream, roomState, peers]);

  console.log(roomState);

  return (
    <HuddleClientProvider value={huddleClient}>
      <>
        <div className="grid grid-cols-2">
          <div className="col-span-1">
            {roomState?.joined && stream && (
              <>
                <video
                  style={{ width: "100%" }}
                  ref={videoRef}
                  autoPlay
                ></video>
              </>
            )}
            <div>
              {!stream && (
                <>
                  <button onClick={() => joinCall()}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                  </button>
                </>
              )}

              {roomState?.joined && stream && (
                <>
                  <button onClick={() => leaveCall()}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* {!micPaused && (
                <button onClick={() => huddleClient.muteMic()}>Mute Mic</button>
              )}
              {micPaused && (
                <button onClick={() => huddleClient.unmuteMic()}>
                  unmute Mic
                </button>
              )} */}
            </div>
          </div>
          {roomState?.joined && stream && (
            <div className="col-span-1">
              <div>
                {Object.values(peers).map((peer) => (
                  <PeerVideoAudioElem
                    key={peer.peerId}
                    peerIdAtIndex={peer.peerId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    </HuddleClientProvider>
  );
}
