import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Collection, Creation } from "../../types/space-apps";

type CreationsObject = {
  [collectionId: number]: Creation[];
};

export interface CreationsState {
  spaceId: number;
  collections: Collection[];
  creations: CreationsObject;
}

const initialState: CreationsState = {
  spaceId: 0,
  collections: [],
  creations: [],
};

export const creationsSlice = createSlice({
  name: "creations",
  initialState,
  reducers: {
    setSpaceId: (state, action: PayloadAction<number>) => {
      state.spaceId = action.payload;
      // reset collections and creations
      state.collections = [];
      state.creations = [];
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

export const { setSpaceId, setCollections, setCollectionCreations } =
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
