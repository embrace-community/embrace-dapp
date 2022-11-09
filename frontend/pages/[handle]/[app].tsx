import { BigNumber, Contract, ethers, Signer } from "ethers";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useSigner } from "wagmi";
import Discussion from "../../components/app/discussion";
import DiscussionTopicComments from "../../components/app/discussion/DiscussionTopicComments";
import DiscussionTopics from "../../components/app/discussion/DiscussionTopics";
import AppLayout from "../../components/AppLayout";
import embraceSpacesContract from "../../data/contractArtifacts/EmbraceSpaces.json";
import Spinner from "../../components/Spinner";
import getIpfsJsonContent from "../../lib/web3storage/getIpfsJsonContent";

export default function SpaceViewPage() {
  const [spaceData, setSpaceData] = useState<any>(null);
  const [metadataLoaded, setMetadataLoaded] = useState<any>(false);
  const [contract, setContract] = useState<Contract>();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [memberCountLoaded, setMemberCountLoaded] = useState<boolean>(false);

  const [openTab, setOpenTab] = useState(1);
  const { data: signer, isLoading: isSignerLoading } = useSigner();
  const router = useRouter();
  const routerIsReady = router.isReady;

  // Once router is ready and signer is loaded then initialize the contract
  useEffect(() => {
    if (!routerIsReady || isSignerLoading) return;

    const contract = new Contract(
      process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
      embraceSpacesContract.abi,
      (signer as Signer) ||
        new ethers.providers.Web3Provider((window as any).ethereum)
    );

    setContract(contract);
  }, [routerIsReady, signer, isSignerLoading]);

  // Once contract is initialized then get the space Id from the router handle
  useEffect((): void => {
    if (!contract || !routerIsReady || spaceData) return;

    const handleBytes32 = ethers.utils.formatBytes32String(
      router.query.handle as string
    );

    async function getSpace(MyContract: Contract): Promise<void> {
      try {
        const space = await MyContract.getSpaceFromHandle(handleBytes32);

        if (space) {
          setSpaceData(space);
        }
      } catch (err) {
        console.log(
          "getSpaceId",
          err,
          contract,
          router.query.handle,
          handleBytes32
        );
      }
    }

    getSpace(contract);
  }, [contract]);

  useEffect(() => {
    if (!spaceData) return;

    async function loadSpaceMetadata() {
      if (metadataLoaded) return;

      const metadata = await getIpfsJsonContent(
        spaceData.metadata,
        "readAsText"
      );

      if (metadata?.image) {
        metadata.image = (await getIpfsJsonContent(
          metadata.image,
          "readAsDataURL"
        )) as string;
      }

      // Update the spaceData object with the loaded metadata
      const spaceDataObj = { ...spaceData, metadata };

      setSpaceData(spaceDataObj);
      setMetadataLoaded(true);
    }

    loadSpaceMetadata();
  }, [spaceData, metadataLoaded]);

  useEffect(() => {
    if (!metadataLoaded) return;

    async function getMemberCount() {
      if (contract) {
        const spaceId = BigNumber.from(spaceData.index).toNumber();
        const memberCount = await contract.getMemberCount(spaceId);

        const memberCountNumber = BigNumber.from(memberCount).toNumber();

        setMemberCount(memberCountNumber);
        setMemberCountLoaded(true);
      }
    }

    getMemberCount();
  }, [spaceData, metadataLoaded]);

  const jimmystabs = [
    {
      label: "discussion",
      appnumber: 1,
    },
    {
      label: "proposals",
      appnumber: 2,
    },
    {
      label: "chat",
      appnumber: 3,
    },
    {
      label: "members",
      appnumber: 4,
    },
  ];

  const jimmysdummies = [
    {
      id: 1,
      title: "Sed suscipit, nulla id tempus dapibus?",
      descr:
        "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
      poster: "0x405B353dff19b63C3c2C851f832C006d68b4Cc63",
    },
    {
      id: 2,
      title: "Sed suscipit, nulla id tempus dapibus?",
      descr:
        "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
      poster: "0x405B353dff19b63C3c2C851f832C006d68b4Cc63",
    },
    {
      id: 3,
      title: "Sed suscipit, nulla id tempus dapibus?",
      descr:
        "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
      poster: "0x405B353dff19b63C3c2C851f832C006d68b4Cc63",
    },
    {
      id: 4,
      title: "Sed suscipit, nulla id tempus dapibus?",
      descr:
        "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
      poster: "0x405B353dff19b63C3c2C851f832C006d68b4Cc63",
    },
  ];

  return (
    <>
      <AppLayout title={spaceData?.metadata?.name}>
        {spaceData && metadataLoaded && memberCountLoaded ? (
          <>
            <div className="w-full flex flex-col justify-start text-embracedark extrastyles-specialpadding2">
              <div className="w-full flex flex-row justify-start items-end border-b-2 border-embracedark border-opacity-5 mb-12">
                <img
                  className="w-28 h-28 extrastyles-border-radius extrastyles-negmarg"
                  src={spaceData?.metadata?.image}
                />
                <div className="mb-6 ml-7">
                  <h1 className="font-semibold text-2xl">
                    {spaceData?.metadata?.name}
                  </h1>
                  <div className="w-full flex flex-row mt-1 text-sm">
                    <p className="text-embracedark text-opacity-50 mx-3  mt-4px">
                      {memberCount} Members
                    </p>
                  </div>
                  <div className="w-full flex flex-row mt-1 text-sm">
                    <p className="text-embracedark text-opacity-50 mx-3  mt-4px">
                      {spaceData?.metadata?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="w-full">
                <ul
                  className="flex mb-0 list-none flex-row extrastyles-specialpadding2"
                  role="tablist"
                >
                  {jimmystabs.map((app) => {
                    return (
                      <li
                        className="-mb-px last:mr-0 text-center"
                        key={app.appnumber}
                      >
                        <a
                          className={
                            "text-sm mr-12 py-3 block leading-normal " +
                            (openTab === app.appnumber
                              ? "border-b-4 border-violet-500 font-semibold"
                              : "font-normal")
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenTab(app.appnumber);
                          }}
                          data-toggle="tab"
                          href={"#link" + app.appnumber}
                          role="tablist"
                        >
                          {app.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full">
                  <div className="tab-content tab-space">
                    <div
                      className={openTab === 1 ? "block" : "hidden"}
                      id="link1"
                    >
                      <div className="flex flex-col w-full pl-32 pt-14 justify-start items-start">
                        <button
                          className="
                        rounded-full
                        border-violet-500
                        border-2
                        bg-transparent
                        py-4
                        px-12
                        text-violet-500
                        shadow-sm
                        focus:outline-none
                        focus:ring-none
                        mb-7
                        font-semibold
                        text-xl"
                        >
                          + new topic
                        </button>
                        {jimmysdummies.map((topic) => {
                          return (
                            <div
                              className="w-full border-b-2 border-embracedark border-opacity-5 pb-7 mt-5 text-embracedark"
                              key={topic.id}
                            >
                              <h2 className="text-xl font-semibold">
                                {topic.title}
                              </h2>
                              <p className="text-sm font-normal mt-1">
                                {topic.descr}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div
                      className={openTab === 2 ? "block" : "hidden"}
                      id="link2"
                    >
                      <div className="flex flex-col w-full pl-32 pt-14 justify-start items-start">
                        {/* <p>
                          <DiscussionTopics />
                        </p>

                        <p>
                          <DiscussionTopicComments />
                        </p> */}
                      </div>
                    </div>
                    <div
                      className={openTab === 3 ? "block" : "hidden"}
                      id="link3"
                    >
                      <p></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-10">
            <Spinner />
          </div>
        )}

        {/* <Discussion /> */}
      </AppLayout>
    </>
  );
}
