import { configureStore } from "@reduxjs/toolkit";
import spacesReducer from "./slices/space";
import coreReducer from "./slices/core";
import creationsReducer from "./slices/creations";
import metadataReducer from "./slices/metadata";

export const store = configureStore({
  reducer: {
    core: coreReducer,
    spaces: spacesReducer,
    creations: creationsReducer,
    metadata: metadataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
