import { useContext } from 'react';
import {
  HuddleClientContext,
  HuddleClientStoreContext,
} from '../HuddleClient/context';
import usePeersData from './usePeersData';
import usePeersTracks from './usePeersTracks';
import useMediaDevices from './useMediaDevices';
import useHuddleStore from '../store/useRootStore';

const useHuddleClientStoreContext = () => useContext(HuddleClientStoreContext);
const useHuddleClientContext = () => useContext(HuddleClientContext);

export {
  useHuddleClientStoreContext,
  useHuddleClientContext,
  usePeersData,
  usePeersTracks,
  useMediaDevices,
  useHuddleStore,
};
