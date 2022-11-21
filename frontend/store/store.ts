import { configureStore } from "@reduxjs/toolkit";
import spacesReducer from "./slices/space";

export const store = configureStore({
  reducer: {
    spaces: spacesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
