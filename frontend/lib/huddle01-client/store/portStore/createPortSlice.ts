import logger from '../../HuddleClient/logger';
import { IPeerAudioState, StoreSlice } from './portStoreTypes';

const createPortSlice: StoreSlice<IPeerAudioState> = (set, get) => ({
  peers: new Set(),

  addPeerPort: (peer: string) => {
    logger.info({
      message: `Adding peer ${peer} to port store`,
      meta: {
        peer,
      },
    });

    set(state => ({ peers: state.peers.add(peer) }));
  },

  removePeerPort: (peer: string) => {
    const peerSet = get().peers;
    peerSet.delete(peer);

    logger.info({
      message: `Removed peer ${peer} from port store`,
      meta: {
        peerSet,
      },
    });

    set({ peers: peerSet });
  },
});

export default createPortSlice;
