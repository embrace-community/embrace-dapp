import logger from '../HuddleClient/logger';
import { ILastNStoreType, StoreSlice } from './storeTypes';

const createLastNSlice: StoreSlice<ILastNStoreType> = (set, get) => ({
  maxViewPortCount: 7, // 7 viewport + 1 me viewport;
  activeViewPort: 0,
  isLastNActive: false,
  lastNPeerIds: [],

  getTotalNumberOfSwaps: (newLastN: string[]) => {
    let cnt = 0;

    const lastN = get().lastNPeerIds;

    const lastNSet = new Set<string>(lastN);

    newLastN.map(peerId => {
      if (!lastNSet.has(peerId)) cnt += 1;
    });

    return cnt;
  },

  setLastNPeerIds: (lastNPeerIds: string[]) => {
    const prevLastN = get().lastNPeerIds;

    const totalNumberOfSwaps = get().getTotalNumberOfSwaps(lastNPeerIds);

    logger.info({
      type: 'info',
      message: `totalNumberOfSwaps: ${totalNumberOfSwaps}`,
      meta: {
        lastNPeerIds,
        prevLastN,
        totalNumberOfSwaps,
      },
    });

    set(() => ({
      lastNPeerIds,
    }));

    logger.info({
      type: 'info',
      message: 'setLastNPeerIds() | Added a new LastNPeerId',
      meta: {
        prevLastN,
        lastN: get().lastNPeerIds,
      },
    });
  },

  addPeerToLastN: (peerId: string) => {
    const lastNPeerIds = get().lastNPeerIds;

    if (lastNPeerIds.length > get().maxViewPortCount) {
      logger.error({
        type: 'error',
        message:
          'addPeerToLastN() | lastNPeerIds.length > get().maxViewPortCount',
        meta: {
          lastNPeerIds,
          maxViewPortCount: get().maxViewPortCount,
        },
      });

      return;
    }

    if (lastNPeerIds.length === get().maxViewPortCount) {
      logger.error({
        type: 'error',
        message:
          'addPeerToLastN() | lastNPeerIds.length === get().maxViewPortCount',
        meta: {
          lastNPeerIds,
          maxViewPortCount: get().maxViewPortCount,
        },
      });

      return;
    }

    if (lastNPeerIds.length < get().maxViewPortCount) {
      lastNPeerIds.push(peerId);

      set(() => ({
        lastNPeerIds,
      }));

      logger.info({
        type: 'info',
        message: 'addPeerToLastN() | Peer Added to lastN',
        meta: {
          lastN: get().lastNPeerIds,
        },
      });
    }
  },

  removePeerFromLastN: (peerId: string) => {
    const lastNPeerIds = get().lastNPeerIds;
    const index = lastNPeerIds.indexOf(peerId);
    if (index > -1) {
      lastNPeerIds.splice(index, 1);

      set(() => ({
        lastNPeerIds,
      }));

      logger.info({
        type: 'info',
        message: 'removePeerFromLastN() | Peer Removed from lastN',
        meta: {
          lastN: get().lastNPeerIds,
        },
      });

      return;
    }

    logger.error({
      type: 'error',
      message: 'removePeerFromLastN() | Peer not found in lastN',
      meta: {
        peerId,
        lastN: get().lastNPeerIds,
      },
    });
  },

  activateLastN: () => {
    logger.info({
      type: 'info',
      message: 'activateLastN',
      meta: {
        lastN: get().lastNPeerIds,
      },
    });
    const isLastNActive = true;
    set(() => ({
      isLastNActive,
    }));
  },

  deactivateLastN: () => {
    logger.info({
      type: 'info',
      message: 'deactivateLastN',
      meta: {
        lastN: get().lastNPeerIds,
      },
    });
    const isLastNActive = false;
    set(() => ({
      isLastNActive,
    }));
  },

  addActiveViewPort: (value: number = 1) => {
    const activeViewPort = get().activeViewPort;
    if (activeViewPort + value > get().maxViewPortCount) {
      logger.error({
        type: 'error',
        message:
          'activeViewPort() | Cannot render these many viewports check calculation',
        meta: {
          activeViewPort,
        },
      });
      return;
    }
    set(() => ({
      activeViewPort: activeViewPort + value,
    }));
  },

  removeActiveViewPort: (value: number = 1) => {
    const activeViewPort = get().activeViewPort;
    if (activeViewPort < value) {
      logger.error({
        type: 'error',
        message: 'removeActiveViewPort() | No Active ViewPort',
        meta: {
          activeViewPort,
          value,
        },
      });
      return;
    }
    set(() => ({
      activeViewPort: activeViewPort - value,
    }));
  },
});

export default createLastNSlice;
