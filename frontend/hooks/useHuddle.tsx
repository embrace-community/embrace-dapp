import { useEffect, useRef, useState } from "react";

import {
  HuddleClientProvider,
  getHuddleClient,
  useRootStore,
} from "../lib/huddle01-client";
import { useAccount } from "wagmi";

type WalletData = {
  address: string;
  wallet: string;
  ens: string;
};

function useHuddle(handle: string) {
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
  const account = useAccount();
  const [peerIds, setPeerIds] = useState<string[]>([]);
  const [walletData, setWalletData] = useState<WalletData>();
  const [roomId, setRoomId] = useState<string>();
  const [activeCallers, setActiveCallers] = useState<string[]>([]);

  const initialise = async (address: string, roomId: string) => {
    const _walletData = {
      address: address,
      wallet: address,
      ens: "",
    };

    setWalletData(_walletData);
    setRoomId(roomId);
  };

  const joinCall = async () => {
    // For private / anon spaces then need to create a random room and save it to Ceramic / LIT
    // so that only space members can find the room and join the call
    try {
      if (!roomId || !walletData) return;

      setActiveCallers([...activeCallers, walletData.address]);

      await enableStream();

      await huddleClient.join(roomId, walletData);
    } catch (error) {
      console.log({ error });
    }
  };

  const leaveCall = async () => {
    await huddleClient.close();
    // huddleClient = undefined;
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
      micPaused,
      peerIds,
      setPeerIds,
      initialise,
      joinCall,
      leaveCall,
      activeCallers,
    },
  };
}

export default useHuddle;
