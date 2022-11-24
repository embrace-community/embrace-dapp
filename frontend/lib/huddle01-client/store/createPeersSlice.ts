import logger from '../HuddleClient/logger';
import {
  INewPeerState,
  IPeerStoreStateKeys,
  IPeerStoreType,
  MediaConsumer,
  MediaConsumerTypes,
  Reaction,
  StoreSlice,
} from './storeTypes';

const MediaConsumerTypesObj = {
  cam: 'isCamPaused',
  mic: 'isMicPaused',
  share: 'isSharePaused',
};

const createPeersSlice: StoreSlice<IPeerStoreType> = (set, get) => ({
  peerCount: 0,
  peers: {},

  increasePeerCount: (value: number = 1) => {
    set(state => ({ peerCount: state.peerCount + value }));
    logger.info({
      message: 'increasePeerCount',
      peerCount: get().peerCount,
    });
  },

  decreasePeerCount: (value: number = 1) => {
    if (get().peerCount < value) {
      logger.error({
        message: 'decreacePeerCount | peerCount is not sufficient',
        peerCount: get().peerCount,
      });
      return;
    }
    set(state => ({ peerCount: state.peerCount - value }));
    logger.info({
      message: 'decreacePeerCount',
      peerCount: get().peerCount,
    });
  },

  addPeer: (peerId: string, peer: INewPeerState) => {
    const prevPeers = get().peers;
    set(() => ({
      peers: {
        ...prevPeers,
        [peerId]: peer,
      },
    }));
  },

  removePeer: (peerId: string) => {
    const peers = get().peers;
    delete peers[peerId];

    set(() => ({
      peers: {
        ...peers,
      },
    }));
  },

  addConsumerMedia: (
    peerId: string,
    consumerType: MediaConsumerTypes,
    consumer: MediaConsumer
  ) => {
    const peer = get().peers[peerId];
    set(() => ({
      peers: {
        ...get().peers,

        [peerId]: {
          ...peer,
          consumers: {
            mic: peer.consumers?.mic,
            cam: peer.consumers?.cam,
            share: peer.consumers?.share,
            shareAudio: peer.consumers?.shareAudio,
            [consumerType]: consumer,
          },
          [MediaConsumerTypesObj[consumerType]]: false,
          isSharePaused: consumerType === 'share',
        },
      },
    }));
  },

  removeConsumerMedia: (peerId: string, consumerType: MediaConsumerTypes) => {
    const peers = get().peers;
    if (!peers[peerId]) return;

    delete peers[peerId]?.consumers?.[consumerType];

    set(() => ({
      peers: {
        ...peers,
        [peerId]: {
          ...peers[peerId],
          [MediaConsumerTypesObj[consumerType]]: true,
        },
      },
    }));
  },

  pauseConsumerMedia: (peerId: string, consumerType: MediaConsumerTypes) => {
    const peers = get().peers;
    if (!peers[peerId]) return;

    set(() => ({
      peers: {
        ...peers,
        [peerId]: {
          ...peers[peerId],
          [MediaConsumerTypesObj[consumerType]]: true,
        },
      },
    }));
  },

  resumeConsumerMedia(peerId: string, consumerType: MediaConsumerTypes) {
    const peers = get().peers;
    if (!peers[peerId]) return;

    set(() => ({
      peers: {
        ...peers,
        [peerId]: {
          ...peers[peerId],
          [MediaConsumerTypesObj[consumerType]]: false,
        },
      },
    }));
  },
  togglePeerHandRaise(peerId: string, isHandRaised: boolean) {
    const peers = get().peers;
    if (!peers[peerId]) return;

    set(() => ({
      peers: {
        ...peers,
        [peerId]: {
          ...peers[peerId],
          isHandRaised,
        },
      },
    }));
  },

  updatePeers: (
    peerId: string,
    consumerType: IPeerStoreStateKeys,
    value: any
  ) => {
    const prevPeers = get().peers;
    const updatedPeers = {
      ...prevPeers,
      [peerId]: {
        ...prevPeers[peerId],
        [consumerType]: value,
      },
    };
    set(() => ({
      peers: {
        ...updatedPeers,
      },
    }));
  },

  addReaction: (peerId: string, reaction: Reaction) => {
    const prevPeers = get().peers;
    const prevPeer = prevPeers[peerId];
    delete prevPeers[peerId];

    set(() => ({
      peers: {
        ...prevPeers,
        [peerId]: {
          ...prevPeer,
          reaction: reaction,
        },
      },
    }));

    setTimeout(() => {
      get().removeReaction(peerId);
    }, 5000);
  },

  removeReaction: (peerId: string) => {
    const prevPeers = get().peers;
    const prevPeer = prevPeers[peerId];
    delete prevPeers[peerId];

    set(() => ({
      peers: {
        ...prevPeers,

        [peerId]: {
          ...prevPeer,
          reaction: '',
        },
      },
    }));
  },

  setPeerAvatarUrl(peerId: string, url: string) {
    const prevPeers = get().peers;
    const prevPeer = prevPeers[peerId];
    delete prevPeers[peerId];

    set(() => ({
      peers: {
        ...prevPeers,
        [peerId]: {
          ...prevPeer,
          avatarUrl: url,
        },
      },
    }));
  },
});

export default createPeersSlice;
