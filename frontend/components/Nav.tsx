import Link from "next/link";
import Icons from "../assets/Icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Nav() {
  return (
    <>
      <div className="w-full p-0 flex-row px-10 py-5 items-center bg-embracebg hidden md:flex">
        <Link key="Home" href="/" className="w-[184px]">
          <Icons.Logo />
        </Link>
        <div className="flex-1"></div>

        <ConnectButton label="Connect" />
      </div>

      <div className="w-full p-0 flex-row px-10 py-5 items-center justify-center bg-embracebg flex md:hidden">
        <Link key="Home" href="/" className="w-[184px]">
          <Icons.Logo />
        </Link>
      </div>

      <div className="w-full p-0 flex-row items-center justify-center bg-embracebg flex md:hidden">
        <ConnectButton label="Connect" />
      </div>
    </>
  );
}
