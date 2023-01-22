import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Space } from "../../types/space";
import { RootState } from "../store";

export interface SpacesState {
  loaded: boolean;
  communitySpaces: Space[];
  yourSpaces: Space[];
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

    addCreatedSpace: (state, action: PayloadAction<Space>) => {
      // Allowed to mutate state directly in RTK
      if (!state.yourSpaces.find((space) => space.id === action.payload.id)) {
        state.yourSpaces.push(action.payload);
      }
    },

    moveJoinedToYourSpaces: (state, action: PayloadAction<number>) => {
      const space = state.communitySpaces.find(
        (space) => space.id === action.payload,
      );

      if (space) {
        state.yourSpaces.push(space);
        state.communitySpaces = state.communitySpaces.filter(
          (space) => space.id !== action.payload,
        );
      }
    },
  },
});

export const {
  setCommunitySpaces,
  setLoaded,
  setYourSpaces,
  addCreatedSpace,
  moveJoinedToYourSpaces,
} = spacesSlice.actions;

export const getSpaceById = createSelector(
  (state: RootState) => state.spaces.yourSpaces,
  (state: RootState) => state.spaces.communitySpaces,
  (yourSpaces: Space[], communitySpaces: Space[]) => {
    return (id: number) => {
      const space = yourSpaces.find((space) => space.id === id);

      if (!space) {
        return communitySpaces.find((space) => space.id === id);
      }

      return space;
    };
  },
);

export default spacesSlice.reducer;
