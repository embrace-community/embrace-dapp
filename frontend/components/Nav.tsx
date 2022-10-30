// import { Fragment } from "react";
// import { Disclosure, Menu, Transition } from "@headlessui/react";
// import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAccount, useDisconnect, Web3Button } from "@web3modal/react";
import Icons from "../assets/Icons";

export default function Nav() {
  const currentRoute = useRouter().pathname;
  const { account } = useAccount();
  const disconnect = useDisconnect();
  return (
    <div className="w-full p-0 flex flex-row px-10 py-5 items-center">
      <Link key="Home" href="/" className="homelink">
        <Icons.Logo />
      </Link>
      <div className="flex-1"></div>
      <>
        {account.isConnected ? (
          <div className="flex flex-row items-center">
            <small
              className="pr-2 underline cursor-pointer"
              onClick={() => disconnect()}
            >
              disconnect
            </small>
            <span className="text-violet-500 font-semibold">
              {account?.address.slice(0, 6) +
                "..." +
                account?.address.slice(-4)}
            </span>

            <img
              className="h-8 w-8 rounded-full ml-3"
              src="https://api.multiavatar.com/Binx Bond.svg"
              alt=""
            />
          </div>
        ) : (
          <Web3Button />
        )}
      </>
    </div>
  );
}
