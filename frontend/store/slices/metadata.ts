import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type CidObject = {
  [key: string]: any;
};

export interface MetadataState {
  cidData: CidObject;
}

const initialState: MetadataState = {
  cidData: {},
};

export const metadataSlice = createSlice({
  name: "metadata",
  initialState,
  reducers: {
    setCid: (state, action: PayloadAction<{ cid: string; data: any[] }>) => {
      const { cid, data } = action.payload;

      state.cidData[cid] = data;
    },
  },
});

export const { setCid } = metadataSlice.actions;

export default metadataSlice.reducer;
