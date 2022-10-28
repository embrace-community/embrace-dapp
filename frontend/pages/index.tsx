import { useAccount, Web3Button } from "@web3modal/react";

export default function HomePage() {
  const { account } = useAccount();

  return (
    <>
      <Web3Button />
      {account.isConnected && <>Your address is: {account.address}</>}
    </>
  );
}
