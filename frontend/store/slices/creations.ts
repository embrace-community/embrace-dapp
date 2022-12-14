import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Collection, Creation } from "../../types/space-apps";

type CreationsObject = {
  [key: number]: Creation[];
};

export interface CreationsState {
  loaded: boolean;
  spaceId: number;
  collections: Collection[];
  creations: CreationsObject;
}

const initialState: CreationsState = {
  loaded: false,
  spaceId: 0,
  collections: [],
  creations: [],
};

export const creationsSlice = createSlice({
  name: "creations",
  initialState,
  reducers: {
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },

    setSpaceId: (state, action: PayloadAction<number>) => {
      state.spaceId = action.payload;
    },

    setCollections: (state, action: PayloadAction<Collection[]>) => {
      state.collections = action.payload;
    },

    setCollectionCreations: (
      state,
      action: PayloadAction<{ collectionId: number; creations: Creation[] }>,
    ) => {
      const { collectionId, creations } = action.payload;

      state.creations[collectionId] = creations;
    },
  },
});

export const { setLoaded, setSpaceId, setCollections, setCollectionCreations } =
  creationsSlice.actions;

export const getCreationById = createSelector(
  (state: RootState) => state.creations.creations,
  (creations: CreationsObject) => {
    return (collectionId: number, creationId: number) => {
      const collectionCreations = creations[collectionId];

      if (!collectionCreations) {
        return null;
      }

      return collectionCreations.find(
        (creation) => creation.tokenId === creationId,
      );
    };
  },
);

export const getCollectionById = createSelector(
  (state: RootState) => state.creations.collections,
  (collections: Collection[]) => {
    return (collectionId: number) => {
      return collections.find((collection) => collection.id === collectionId);
    };
  },
);

export default creationsSlice.reducer;