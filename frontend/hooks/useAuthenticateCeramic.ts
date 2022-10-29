import { getResolver as get3IDResolver } from "@ceramicnetwork/3id-did-resolver";
import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { ComposeClient } from "@composedb/client";

const AuthenticateWithEthereum = async (
  ethereumProvider: any,
  threeId: ThreeIdConnect,
  composeDbClient: ComposeClient
) => {
  // Request accounts from the Ethereum provider
  const accounts = await ethereumProvider.request({
    method: "eth_requestAccounts",
  });
  // Create an EthereumAuthProvider using the Ethereum provider and requested account
  const authProvider = new EthereumAuthProvider(ethereumProvider, accounts[0]);
  // Connect the created EthereumAuthProvider to the 3ID Connect instance so it can be used to
  // generate the authentication secret
  await threeId.connect(authProvider);

  const ceramic = new CeramicClient();
  const did = new DID({
    // Get the DID provider from the 3ID Connect instance
    provider: threeId.getDidProvider(),
    resolver: {
      ...get3IDResolver(ceramic),
    },
  });

  // Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
  // authentication flow using 3ID Connect and the Ethereum provider
  await did.authenticate();

  // The Ceramic client can create and update streams using the authenticated DID
  composeDbClient.setDID(did);
};

export const useAuthenticateCeramic = async (
  threeId: ThreeIdConnect,
  composeDbClient
) => {
  if (window.ethereum == null) {
    throw new Error("No injected Ethereum provider");
  }

  await AuthenticateWithEthereum(window.ethereum, threeId, composeDbClient);
};
