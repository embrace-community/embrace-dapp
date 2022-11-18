import { configureStore } from "@reduxjs/toolkit";
import spacesReducer from "./spaceSlice";

export const store = configureStore({
  reducer: {
    spaces: spacesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
