import { useAccount, Web3Button } from "@web3modal/react";
import UseAccount from "../examples/UseAccount";
import UseBalance from "../examples/UseBalance";
import UseBlockNumber from "../examples/UseBlockNumber";
import UseContract from "../examples/UseContract";
import UseContractEvent from "../examples/UseContractEvent";
import UseContractRead from "../examples/UseContractRead";
import UseContractWrite from "../examples/UseContractWrite";
import UseDisconnect from "../examples/UseDisconnect";
import UseEnsAddress from "../examples/UseEnsAddress";
import UseEnsAvatar from "../examples/UseEnsAvatar";
import UseEnsName from "../examples/UseEnsName";
import UseEnsResolver from "../examples/UseEnsResolver";
import UseFeeData from "../examples/UseFeeData";
import UseNetwork from "../examples/UseNetwork";
import UseProvider from "../examples/UseProvider";
import UsePrepareSendWaitTransaction from "../examples/UseSendTransaction";
import UseSigner from "../examples/UseSigner";
import UseSignMessage from "../examples/UseSignMessage";
import UseSignTypedData from "../examples/UseSignTypedData";
import UseSwitchNetwork from "../examples/UseSwitchNetwork";
import UseToken from "../examples/UseToken";
import UseTransaction from "../examples/UseTransaction";

export default function HomePage() {
  const { account } = useAccount();

  return (
    <>
      <Web3Button />
      {account.isConnected && (
        <>
          <UseAccount />
          <UseDisconnect />
          <UseNetwork />
          <UseSwitchNetwork />
          <UseBlockNumber />
          <UseFeeData />
          <UseBalance />
          <UseProvider />
          <UseSigner />
          <UseSignMessage />
          <UseSignTypedData />
          <UseEnsAddress />
          <UseEnsAvatar />
          <UseEnsName />
          <UseEnsResolver />
          <UseToken />
          <UseTransaction />
          <UsePrepareSendWaitTransaction />
          <UseContract />
          <UseContractRead />
          <UseContractWrite />
          <UseContractEvent />
        </>
      )}
    </>
  );
}
