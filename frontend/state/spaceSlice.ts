import { createSlice } from "@reduxjs/toolkit";
import { EmbraceSpace } from "../types/space";

export interface SpacesState {
  spaces: EmbraceSpace[];
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

// Action creators are generated for each case reducer function
export const { setSpaces, setLoaded } = spacesSlice.actions;

export default spacesSlice.reducer;
