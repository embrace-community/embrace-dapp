import { ComposeClient } from "@composedb/client";
import { createContext } from "react";
import { ceramicUri } from "./envs";
// Path to the generated runtime composite definition
import { definition } from "./Runtime"; // dummy runtime to get UI up and running

// kjzl6hvfrbw6c76kvqxy53q10bxymmyfzrjy2v4vb153eg8yz0r9vyyu6gfnvwg is the model Id
export const composeDbClient = new ComposeClient({
  ceramic: ceramicUri,
  definition,
});

export const CeramicContext = createContext<ComposeClient>(composeDbClient);
