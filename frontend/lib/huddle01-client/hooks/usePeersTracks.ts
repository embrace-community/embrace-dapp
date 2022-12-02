import useRootStore from '../store/useRootStore';

const usePeersTracks = () => {
  const peers = useRootStore(state => state.peers);
  const lastNArr = useRootStore(state => state.lastNPeerIds);

  if (!peers) {
    throw new Error('No Peer Data Found');
  }

  let tracks;

  if (lastNArr.length > 0) {
    tracks = Object.values(lastNArr).map(peerId => peers[peerId].consumers);
  } else tracks = Object.values(peers).map(peer => peer.consumers);

  return tracks;
};

export default usePeersTracks;
