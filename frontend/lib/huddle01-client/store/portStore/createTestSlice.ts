import { ITestState, StoreSlice } from './portStoreTypes';

const createTestSlice: StoreSlice<ITestState> = set => ({
  isTest: true,
  toggleIsTest: () => {
    set(state => ({ isTest: !state.isTest }));
  },
});

export default createTestSlice;
