import useRootStore from '../store/useRootStore';

const usePeersData = () => {
  const peers = useRootStore(state => state.peers);

  if (!peers) {
    throw new Error('No Peer Data Found');
  }

  const peerData = Object.values(peers);

  return peerData;
};

export default usePeersData;
