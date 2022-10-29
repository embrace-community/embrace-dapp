import { createContext, Dispatch, SetStateAction } from "react";

// Initialises the value with 'null'
// and provides a method to update the context state
export const SpaceContext = createContext<
  [number | null, Dispatch<SetStateAction<number>>]
>([null, () => {}]);
