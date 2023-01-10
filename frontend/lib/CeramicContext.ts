import { ComposeClient } from "@composedb/client";
import { createContext } from "react";
// Path to the generated runtime composite definition
import { definition } from "./Runtime"; // dummy runtime to get UI up and running

// TODO: Have this setup in the ENV
export const composeDbClient = new ComposeClient({
  ceramic: "http://18.232.169.242:7007/", //kjzl6hvfrbw6c76kvqxy53q10bxymmyfzrjy2v4vb153eg8yz0r9vyyu6gfnvwg
  definition,
});

export const CeramicContext = createContext<ComposeClient>(composeDbClient);
