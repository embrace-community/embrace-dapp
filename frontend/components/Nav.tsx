import Link from "next/link";
import Icons from "../assets/Icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Nav() {
  return (
    <>
      <div className="w-full p-0 flex flex-row px-10 py-5 items-center bg-embracebg">
        <Link key="Home" href="/" className="w-[184px]">
          <Icons.Logo />
        </Link>
        <div className="flex-1"></div>

        <ConnectButton label="Connect" />
      </div>
    </>
  );
}
