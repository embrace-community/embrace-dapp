import { IHostControlsStoreType, StoreSlice } from './storeTypes';

const createHostControlsSlice: StoreSlice<IHostControlsStoreType> = (
  set,
  get
) => ({
  hostId: null,
  meId: '',
  coHosts: [],
  hostControl: {
    allowVideo: true,
    allowAudio: true,
    allowScreenShare: true,
    allowChat: true,
  },

  setHost: hostId => {
    set(() => ({ hostId }));
  },

  setCoHosts: coHosts => {
    set(() => ({ coHosts }));
  },

  setHostControl: control => {
    set(() => ({ hostControl: control }));
  },
  setSingleHostControl: (control, val) => {
    set(() => ({
      hostControl: { ...get().hostControl, [control]: val },
    }));
  },

  initHostControls: (hostId, meId, hostControl, coHosts) => {
    set(() => ({ hostId, meId, coHosts, hostControl }));
  },
});

export default createHostControlsSlice;
