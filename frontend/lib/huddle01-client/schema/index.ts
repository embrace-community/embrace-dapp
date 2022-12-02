import { types as mediasoupTypes } from 'mediasoup-client';
import { getState, setState } from '../store/useRootStore';
import {
  getState as getPortState,
  setState as setPortState,
} from '../store/portStore/usePortStore';
import { MediaConsumer } from '../store/storeTypes';
export interface ProtooUrlData {
  roomId: string;
  peerId: string;
  apiKey: string | undefined;
}

export interface HuddleClientStore {
  mediasoupDevice: null | mediasoupTypes.Device;
  displayName: string;
  avatarUrl: string;
  consume: boolean;
  produce: boolean;
  consumers: {
    [key: string]: MediaConsumer;
  };
  producers: {
    [key: string]: MediaConsumer;
  };
  features: {
    recording: Recordingfeat;
  };
}

export interface Recordingfeat {
  state?: null | 'starting' | 'recording' | 'processing';
  recordingUrl?: string;
  ipfsUrl?: string;
}

export type SetHuddleClientStore = React.Dispatch<
  React.SetStateAction<HuddleClientStore>
>;

export type SetHuddleStoreType = typeof setState;
export type GetHuddleStoreType = typeof getState;

export type SetPortStoreType = typeof setPortState;
export type GetPortStoreType = typeof getPortState;

export interface JoinParams {
  displayName: string;
  avatarUrl: string;
}

export interface ClientState {
  recvTransport: null | mediasoupTypes.Transport;
  sendTransport: null | mediasoupTypes.Transport;
}

export interface RequestMethods {
  [key: string]: () => void;
}
export interface NotifMethods {
  [key: string]: () => void;
}
export interface LastNData {
  lastNPeers: string[];
  mostInactivePeerIdInLastN: string;
}

export type TWalletData = {
  address: string;
  wallet: string | undefined;
  ens: string;
};

export type TLiveStreamObject = {
  streamLink: string;
  streamKey: string;
  streamName: string;
};
