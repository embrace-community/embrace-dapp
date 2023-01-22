import create, { GetState, SetState } from 'zustand';
import { devtools } from 'zustand/middleware';
import createGridSlice from './createGridSlice';
import createTestSlice from './createTestSlice';
import createMeSlice from './createMeSlice';
import createPeersSlice from './createPeersSlice';
import createLastNSlice from './createLastNSlice';
import createMediaSlice from './createMediaSlice';
import createFigmentSlice from './createFigmentSlice';
import createRecordingSlice from './createRecordingSlice';
import createRoomStateSlice from './createRoomStateSlice';
import createChatSlice from './createChatSlice';
import createLobbyPeersSlice from './createLobbyPeersSlice';
import createHostControlsSlice from './createHostControlsSlice';
import createLiveStreamingSlice from './createLiveStreamingSlice';
import createNetworkSlice from './createNetworkSlice';
import createSpeakerSlice from './createSpeakerSlice';
import createActiveSpeakerSlice from './createActiveSpeakerSlice';
import createLayoutSlice from './createLayoutSlice';

import { IState } from './storeTypes';
import createMicSlice from './createMicSlice';

const createRootSlice = (set: SetState<IState>, get: GetState<IState>) => ({
  ...createGridSlice(set, get),
  ...createMeSlice(set, get),
  ...createPeersSlice(set, get),
  ...createTestSlice(set, get),
  ...createLastNSlice(set, get),
  ...createMediaSlice(set, get),
  ...createFigmentSlice(set, get),
  ...createRecordingSlice(set, get),
  ...createChatSlice(set, get),
  ...createLobbyPeersSlice(set, get),
  ...createRoomStateSlice(set, get),
  ...createNetworkSlice(set, get),
  ...createHostControlsSlice(set, get),
  ...createLiveStreamingSlice(set, get),
  ...createSpeakerSlice(set, get),
  ...createMicSlice(set, get),
  ...createActiveSpeakerSlice(set, get),
  ...createLayoutSlice(set, get),
});

const useRootStore = create(
  devtools(createRootSlice, {
    name: 'huddle01-client',
    anonymousActionType: 'action',
    enabled: process.env.NODE_ENV === 'development',
  })
);

export const useHuddleStore = create(
  devtools(createRootSlice, {
    name: 'huddle01-client',
    anonymousActionType: 'action',
    enabled: process.env.NODE_ENV === 'development',
  })
);

const { getState, setState } = useRootStore;

export { getState, setState };

export default useRootStore;
