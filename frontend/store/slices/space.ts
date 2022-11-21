import { createSlice } from "@reduxjs/toolkit";
import { InternalSpace } from "../../entities/space";

export interface SpacesState {
  spaces: InternalSpace[];
  loaded: boolean;
}

const initialState: SpacesState = {
  loaded: false,
  spaces: [],
};

export const spacesSlice = createSlice({
  name: "spaces",
  initialState,
  reducers: {
    setSpaces: (state, action) => {
      state.spaces = action.payload;
    },

    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
  },
});

export const { setSpaces, setLoaded } = spacesSlice.actions;

export default spacesSlice.reducer;
