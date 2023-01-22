import logger from '../HuddleClient/logger';
import { GridViewTypes, IGridState, StoreSlice } from './storeTypes';

const createGridSlice: StoreSlice<IGridState> = (set, get) => ({
  gridView: 'grid',
  screenSharePeerId: null,

  setGridView: (gridView: GridViewTypes, peerId?: string) => {
    if (gridView === 'share' && !peerId) {
      logger.error({
        type: 'error',
        message: 'GridViewTypes.share requires peerId',
        gridView,
      });
      return;
    }

    if (gridView === 'share' && peerId) {
      set(() => ({
        gridView,
        screenSharePeerId: peerId,
      }));
      return;
    }

    set(() => ({
      gridView,
      screenSharePeerId: null,
    }));
  },

  enableScreenShare: (peerId: string) => {
    if (!peerId) {
      logger.error({
        type: 'error',
        message: 'GridViewTypes.share requires peerId',
        peerId,
      });
      return;
    }
    set(() => ({
      gridView: 'share',
      screenSharePeerId: peerId,
    }));
  },

  disableScreenShare: (fallBackView: GridViewTypes = 'grid') => {
    if (get().gridView === 'share') {
      set(() => ({
        gridView: fallBackView,
        screenSharePeerId: null,
      }));
    }
  },
});

export default createGridSlice;
