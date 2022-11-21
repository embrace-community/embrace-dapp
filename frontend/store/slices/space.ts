import { createSlice } from "@reduxjs/toolkit";
import { InternalSpace } from "../../entities/space";

export interface SpacesState {
  loaded: boolean;
  communitySpaces: InternalSpace[];
  yourSpaces: InternalSpace[];
}

const initialState: SpacesState = {
  loaded: false,
  communitySpaces: [],
  yourSpaces: [],
};

export const spacesSlice = createSlice({
  name: "spaces",
  initialState,
  reducers: {
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },

    setCommunitySpaces: (state, action) => {
      state.communitySpaces = action.payload;
    },

    setYourSpaces: (state, action) => {
      state.yourSpaces = action.payload;
    },
  },
});

export const { setCommunitySpaces, setLoaded, setYourSpaces } =
  spacesSlice.actions;

export default spacesSlice.reducer;
