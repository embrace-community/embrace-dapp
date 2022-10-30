import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import Icons from "../assets/Icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Nav() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="w-full p-0 flex flex-row px-10 py-5 items-center">
      <Link key="Home" href="/" className="homelink">
        <Icons.Logo />
      </Link>
      <div className="flex-1"></div>
      <>
        {isConnected ? (
          <div className="flex flex-row items-center">
            <small
              className="pr-2 underline cursor-pointer"
              onClick={() => disconnect()}
            >
              disconnect
            </small>
            <span className="text-violet-500 font-semibold">
              {address?.slice(0, 6) + "..." + address?.slice(-4)}
            </span>

            <img
              className="h-8 w-8 rounded-full ml-3"
              src="https://api.multiavatar.com/Binx Bond.svg"
              alt=""
            />
          </div>
        ) : (
          <ConnectButton />
        )}
      </>
    </div>
  );
}
