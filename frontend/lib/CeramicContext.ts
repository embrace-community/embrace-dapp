import { ComposeClient } from "@composedb/client";
import { createContext } from "react";
// Path to the generated runtime composite definition
import { definition } from "./Runtime"; // dummy runtime to get UI up and running

export const composeDbClient = new ComposeClient({
  ceramic: "http://localhost:7007",
  definition,
});

export const CeramicContext = createContext<ComposeClient>(composeDbClient);
