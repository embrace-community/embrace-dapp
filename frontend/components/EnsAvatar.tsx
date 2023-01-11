import Image from "next/image";
import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { deployedChainId } from "../lib/envs";

const EnsAvatar = ({ address, avatarOnly = false }) => {
  const provider = useProvider();
  const [ens, setEns] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!address || ens) return;

    const fetchEns = async () => {
      const shortenedAddress =
        address.substring(0, 6) +
        "..." +
        address.substring(address.length - 6, address.length);

      // Only looks for ENS record if on Goerli network with a provider
      if (!provider || deployedChainId !== 5) {
        setEns((previous) => shortenedAddress);
        return;
      }

      const lookup = await provider.lookupAddress(address);

      if (lookup) {
        setEns((previous) => lookup);
        const avatar = await provider.getAvatar(address);
        if (avatar) setAvatar((previous) => avatar);
      } else {
        setEns((previous) => shortenedAddress);
      }
    };

    fetchEns();
  }, [address, ens, provider]);

  return (
    <span className="flex">
      {avatar ? (
        <Image
          className="w-5 h-5 rounded-full mr-1"
          src={avatar}
          alt="Avatar"
          height={20}
          width={20}
        />
      ) : (
        <span className="w-5 h-5 bg-slate-100 rounded-full mr-1"></span>
      )}
      {!avatarOnly ? <span className="mr-1">{ens}</span> : null}
    </span>
  );
};

export default EnsAvatar;
