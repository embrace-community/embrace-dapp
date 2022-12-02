import { INetworkState, StoreSlice, TNetStats } from './storeTypes';

const createNetworkSlice: StoreSlice<INetworkState> = (set, get) => ({
  networkStats: {
    last_updated: Date.now(),
    data: {},
  },
  bandwidthSaver: false,
  setBandwidthSaver: (value: boolean) => {
    set(() => ({ bandwidthSaver: value }));
  },
  setNetworkStats: (stats: TNetStats) => {
    const prevStats = get().networkStats;
    if (prevStats.last_updated > stats.last_updated) {
      return;
    }
    if (prevStats.data === stats.data) {
      return;
    }
    set(() => ({
      networkStats: stats,
    }));
  },
});

export default createNetworkSlice;
