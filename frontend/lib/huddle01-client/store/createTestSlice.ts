import { ITestState, StoreSlice } from './storeTypes';

const createTestSlice: StoreSlice<ITestState> = set => ({
  isTest: true,
  toggleIsTest: () => {
    set(state => ({ isTest: !state.isTest }));
  },
});

export default createTestSlice;
