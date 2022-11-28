import { ISpeakerState, StoreSlice } from './storeTypes';

const createSpeakerSlice: StoreSlice<ISpeakerState> = (set, _get) => ({
  activeSpeaker: null,

  setActiveSpeaker(activeSpeaker) {
    set(() => ({
      activeSpeaker,
    }));
  },
});

export default createSpeakerSlice;
