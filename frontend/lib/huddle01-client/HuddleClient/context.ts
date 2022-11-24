import { createContext } from 'react';
import { HuddleClientStore } from '../schema';
import HuddleClient from './HuddleClient';

export const initialStore = {
  mediasoupDevice: null,
  consume: true,
  produce: true,
  displayName: 'axit',
  avatarUrl: '',
  consumers: {},
  producers: {},
  features: {
    recording: {
      state: null,
    },
  },
};

export const HuddleClientContext = createContext<HuddleClient>(
  {} as HuddleClient
);
export const HuddleClientStoreContext =
  createContext<HuddleClientStore>(initialStore);
