import { ComposeClient } from "@composedb/client";
import { createContext } from "react";
import { ceramicUri } from "./envs";
// Path to the generated runtime composite definition
import { definition } from "./Runtime";

// kjzl6hvfrbw6c5o8kixyadk5xegjd9obau04dcc31adirpedhq3c9xf6d6mjvi6 & kjzl6hvfrbw6camlf39lcxw6vx4elhhbmn3wfowg2wi8nn9utu69qgyriifsif2
console.log("Ceramic URI", ceramicUri);
export const composeDbClient = new ComposeClient({
  ceramic: ceramicUri,
  definition,
});

export const CeramicContext = createContext<ComposeClient>(composeDbClient);
