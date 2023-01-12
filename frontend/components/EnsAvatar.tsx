import Image from "next/image";
import { useEffect, useState } from "react";
import { useProvider } from "wagmi";
import { deployedChainId } from "../lib/envs";

const EnsAvatar = ({ address, avatarOnly = false }) => {
  const provider = useProvider();
  const [ens, setEns] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!address || ens || loading) return;

    const fetchEns = async () => {
      setLoading((previous) => true);
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
  }, [address, ens, provider, loading]);

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
        <Image
          className="h-5 w-5 rounded-full mr-3"
          src={`https://api.multiavatar.com/${address}.svg`}
          alt="Avatar"
          height={20}
          width={20}
        />
      )}
      {!avatarOnly ? <span className="mr-1">{ens}</span> : null}
    </span>
  );
};

export default EnsAvatar;
