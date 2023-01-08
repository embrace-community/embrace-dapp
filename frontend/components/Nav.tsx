import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  return (
    <>
      <div className="w-full p-0 flex-row px-10 py-5 items-center bg-embrace-bg hidden md:flex">
        <Link key="Home" href="/">
          <Image
            src={"/logos/embrace-earth-web.png"}
            width={235} // 774
            height={57} // 188
            alt="Embrace Logo"
          />
        </Link>
        <div className="flex-1"></div>

        <ConnectButton label="Connect" />
      </div>

      <div className="w-full p-0 flex-row px-10 py-5 items-center justify-center bg-embrace-bg flex md:hidden">
        <Link key="Home" href="/" className="w-[184px]">
          <Image
            src={"/logos/embrace-earth-web.png"}
            width={235} // 774
            height={57} // 188
            alt="Embrace Logo"
          />
        </Link>
      </div>

      <div className="w-full p-0 flex-row items-center justify-center bg-embrace-bg flex md:hidden">
        <ConnectButton label="Connect" />
      </div>
    </>
  );
}
