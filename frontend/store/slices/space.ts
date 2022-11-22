import { createSelector, createSlice } from "@reduxjs/toolkit";
import { InternalSpace } from "../../entities/space";
import { RootState } from "../store";

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

    setSpaceMetadata: (state, action) => {
      state.yourSpaces = action.payload;
    },
  },
});

export const { setCommunitySpaces, setLoaded, setYourSpaces } =
  spacesSlice.actions;

export const getSpaceById = createSelector(
  (state: RootState) => state.spaces.yourSpaces,
  (state: RootState) => state.spaces.communitySpaces,
  (yourSpaces: InternalSpace[], communitySpaces: InternalSpace[]) => {
    return (id: number) => {
      const space = yourSpaces.find((space) => space.id === id);

      if (!space) {
        return communitySpaces.find((space) => space.id === id);
      }

      return space;
    };
  }
);

export default spacesSlice.reducer;
