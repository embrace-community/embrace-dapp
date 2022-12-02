import HuddleClient from "../lib/huddle01-client/HuddleClient/HuddleClient";
import { useState } from "react";

import {
  HuddleClientProvider,
  getHuddleClient,
  useRootStore,
} from "../lib/huddle01-client";

type WalletData = {
  address: string;
  wallet: string;
  ens: string;
};

function useHuddle(handle: string) {
  const stream = useRootStore((state) => state.stream);
  const enableStream = useRootStore((state) => state.enableStream);
  const pauseTracks = useRootStore((state) => state.pauseTracks);
  const isCamPaused = useRootStore((state) => state.isCamPaused);
  const peers = useRootStore((state) => state.peers);
  const peerId = useRootStore((state) => state.peerId);
  const lobbyPeers = useRootStore((state) => state.lobbyPeers);
  const roomState = useRootStore((state) => state.roomState);
  const isMicPaused = useRootStore((state) => state.isMicPaused);

  const [peerIds, setPeerIds] = useState<string[]>([]);
  const [walletData, setWalletData] = useState<WalletData>();
  const [roomId, setRoomId] = useState<string>();
  const [huddleClient, setHuddleClient] = useState<HuddleClient | null>();

  const initialise = async (address: string, roomId: string) => {
    const _walletData = {
      address: address,
      wallet: address,
      ens: "",
    };

    const _huddleClient = getHuddleClient("YOUR_API_KEY");
    setHuddleClient(_huddleClient);
    setWalletData(_walletData);
    setRoomId(roomId);
  };

  const reinitialise = async () => {
    if (walletData && roomId) {
      const _huddleClient = getHuddleClient("YOUR_API_KEY");
      setHuddleClient(_huddleClient);

      await enableStream();

      await _huddleClient?.join(roomId, walletData);
    }
  };

  const joinCall = async () => {
    // For private / anon spaces then need to create a random room and save it to Ceramic / LIT
    // so that only space members can find the room and join the call
    try {
      if (!roomId || !walletData || !huddleClient) {
        reinitialise();
        return;
      }

      await enableStream();

      await huddleClient.join(roomId, walletData);
    } catch (error) {
      console.log({ error });
    }
  };

  const leaveCall = async () => {
    if (!huddleClient) return;

    await huddleClient.close();
    setHuddleClient(null);
  };

  return {
    HuddleClientProvider,
    huddle: {
      client: huddleClient,
      stream,
      enableStream,
      pauseTracks,
      isCamPaused,
      peers,
      peerId,
      lobbyPeers,
      roomState,
      isMicPaused,
      peerIds,
      setPeerIds,
      initialise,
      joinCall,
      leaveCall,
      reinitialise,
    },
  };
}

export default useHuddle;
