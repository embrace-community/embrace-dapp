import create, { GetState, SetState } from 'zustand';
import { devtools } from 'zustand/middleware';
import createTestSlice from './createTestSlice';
import createPortSlice from './createPortSlice';
import createViewPortSlice from './createViewPortSlice';

import { IPortState } from './portStoreTypes';

const createPortStore = (
  set: SetState<IPortState>,
  get: GetState<IPortState>
) => ({
  ...createTestSlice(set, get),
  ...createPortSlice(set, get),
  ...createViewPortSlice(set, get),
});

const usePortStore = create(
  devtools(createPortStore, {
    name: 'huddle01-PortStore',
    anonymousActionType: 'action',
  })
);

const { getState, setState } = usePortStore;

export { getState, setState };

export default usePortStore;
