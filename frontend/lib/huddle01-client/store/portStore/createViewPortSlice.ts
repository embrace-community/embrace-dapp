import logger from '../../HuddleClient/logger';
import { IViewPortState, StoreSlice } from './portStoreTypes';

const createViewPortSlice: StoreSlice<IViewPortState> = (set, get) => ({
  isLastNActive: false,
  activeViewPortIds: new Set(),
  activeViewPortCount: 0,
  maxViewPortCount: 7, // 7 viewport + 1 me viewport;

  getSpaceLeftInViewport: () =>
    get().maxViewPortCount - get().activeViewPortCount,

  getActiveViewPortIds: () => get().activeViewPortIds,

  activateLastN: () => {
    const spaceLeft = get().getSpaceLeftInViewport();
    if (spaceLeft === 0) {
      logger.info({
        type: 'ViewPortStore',
        message: 'activateLastN() | no space left in viewport',
      });
      set({ isLastNActive: true });
    }
  },

  deactivateLastN: () => {
    const activeViewPortCount = get().activeViewPortCount;
    if (activeViewPortCount <= get().maxViewPortCount) {
      logger.info({
        type: 'ViewPortStore',
        message: 'deactivateLastN() | deactivating last n',
      });
      set({
        isLastNActive: false,
      });
    }
  },

  setActiveViewPort: (activeViewPortIds: string[]) => {
    logger.info({
      activeViewPortIds,
      message: 'Setting active view port ids',
      meta: {
        activeViewPortIds,
      },
    });

    const initViewPortCount = activeViewPortIds.length;

    let lastNStatus = get().isLastNActive;

    if (initViewPortCount < get().maxViewPortCount) {
      logger.info({
        message:
          'setActiveViewPort() | Setting lastNStatus to false as less peers joined',
        meta: {
          initViewPortCount,
          maxViewPortCount: get().maxViewPortCount,
        },
      });

      lastNStatus = false;
    }

    const activeViewPortSet = new Set(activeViewPortIds);

    set({
      isLastNActive: lastNStatus,
      activeViewPortIds: activeViewPortSet,
      activeViewPortCount: initViewPortCount,
    });
  },

  addPeerViewPort: (peerId: string) => {
    logger.info({
      peerId,
      message: 'Adding peer view port',
      meta: {
        peerId,
      },
    });

    const activeViewPortCount = get().activeViewPortCount;

    if (activeViewPortCount < get().maxViewPortCount) {
      logger.info({
        message: 'addPeerViewPort() | Adding peer to active view port ids',
        meta: {
          peerId,
          activeViewPortCount,
          maxViewPortCount: get().maxViewPortCount,
        },
      });

      const activeViewPortIds = get().activeViewPortIds;
      activeViewPortIds.add(peerId);

      set({
        activeViewPortIds,
        activeViewPortCount: activeViewPortCount + 1,
      });
    }
  },

  removePeerViewPort(peerId: string) {
    logger.info({
      peerId,
      message: 'Removing peer view port',
      meta: {
        peerId,
      },
    });

    const activeViewPortCount = get().activeViewPortCount;
    const activeViewPortIds = get().activeViewPortIds;

    if (activeViewPortIds.has(peerId) && activeViewPortCount > 0) {
      logger.info({
        message:
          'removePeerViewPort() | Removing peer from active view port ids',
        meta: {
          peerId,
          activeViewPortCount,
          maxViewPortCount: get().maxViewPortCount,
        },
      });

      activeViewPortIds.delete(peerId);

      set({
        activeViewPortIds,
        activeViewPortCount: activeViewPortCount - 1,
      });
    }
  },
});

export default createViewPortSlice;
