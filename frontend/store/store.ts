import { configureStore } from "@reduxjs/toolkit";
import spacesReducer from "./slices/space";
import coreReducer from "./slices/core";

export const store = configureStore({
  reducer: {
    spaces: spacesReducer,
    core: coreReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
