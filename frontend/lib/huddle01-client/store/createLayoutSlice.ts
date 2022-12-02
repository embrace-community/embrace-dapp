import logger from '../HuddleClient/logger';
import { ILayoutSchemaType, ILayoutSlice, StoreSlice } from './storeTypes';

const createLayoutSlice: StoreSlice<ILayoutSlice> = (set, get) => ({
  layout: {
    type: 'sideBarView',
  },

  setLayoutView: (type: ILayoutSchemaType) => {
    if (get().layout.type === type) {
      logger.warn('Layout type is already set to: ', type);

      return;
    }
    set(() => ({ layout: { type } }));
  },
});

export default createLayoutSlice;
