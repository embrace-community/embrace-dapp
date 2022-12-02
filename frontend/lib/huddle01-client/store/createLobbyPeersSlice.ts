import { ILobbyPeersStoreType, StoreSlice } from './storeTypes';

const createLobbyPeersSlice: StoreSlice<ILobbyPeersStoreType> = set => ({
  lobbyPeers: [],

  addLobbyPeer: peer => {
    set(state => ({
      lobbyPeers: [...state.lobbyPeers, peer],
    }));
  },

  setLobbyPeers: peers => {
    set(() => ({ lobbyPeers: peers }));
  },
});

export default createLobbyPeersSlice;
