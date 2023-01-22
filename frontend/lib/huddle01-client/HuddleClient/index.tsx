import React, { FunctionComponent } from 'react';

// context api
import { HuddleClientContext } from './context';

// lib
import HuddleClient from './HuddleClient';
import { useRootStore } from '../index';
import usePortStore from '../store/portStore/usePortStore';

const HuddleClientProvider: FunctionComponent<{
  value: HuddleClient;
  children: React.ReactNode;
}> = ({ children, value }) => {
  const { getState } = useRootStore;
  const { getState: getPortState } = usePortStore;

  HuddleClient.init(getState);
  HuddleClient.initPort(getPortState);

  return (
    <HuddleClientContext.Provider value={value}>
      {children}
    </HuddleClientContext.Provider>
  );
};

export default HuddleClientProvider;
