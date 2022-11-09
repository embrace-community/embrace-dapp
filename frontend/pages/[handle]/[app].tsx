import { BigNumber, Contract, ethers, Signer } from "ethers";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useSigner } from "wagmi";
import Discussion from "../../components/app/discussion";
import DiscussionTopicComments from "../../components/app/discussion/DiscussionTopicComments";
import DiscussionTopics from "../../components/app/discussion/DiscussionTopics";
import AppLayout from "../../components/AppLayout";
import embraceSpacesContract from "../../data/contractArtifacts/EmbraceSpaces.json";
import { SpaceContext } from "../../lib/SpaceContext";
import Spinner from "../../components/Spinner";

export default function SpaceViewPage() {
  const [spaceId, setSpaceId] = useContext(SpaceContext);
  const [spaceData, setSpaceData] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
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
    if (!contract || !routerIsReady) return;

    const handleBytes32 = ethers.utils.formatBytes32String(
      router.query.handle as string
    );

    async function getSpaceId(MyContract: Contract): Promise<void> {
      try {
        const response = await MyContract.getIdFromHandle(handleBytes32);

        // Only set space Id if the space is found
        if (response) {
          const spaceId = BigNumber.from(response).toNumber();
          if (spaceId) {
            setSpaceId(spaceId);
          }
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

    getSpaceId(contract);
  }, [contract]);

  // Once space Id is set then get the space data
  useEffect((): void => {
    if (!contract || !routerIsReady || spaceId == -1) return;

    async function getSpace(MyContract: Contract): Promise<void> {
      try {
        const spaceDetails = await MyContract.getSpace(spaceId);
        const memberCount = await MyContract.getMemberCount(spaceId);
        // Now we have the space data, we need to get the metadata from IPFS
        // and merge with the response
        console.log("Space details", spaceDetails, "Member count", memberCount);
        setSpaceData(spaceDetails);
      } catch (err) {
        console.log("getSpace", err);
      }
    }

    getSpace(contract);
  }, [spaceId]);

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
      <AppLayout title="Get Space Name from Handle">
        {spaceId !== -1 ? (
          <div className="">
            <div className="w-full flex flex-col justify-start text-embracedark extrastyles-specialpadding2">
              <div className="w-full flex flex-row justify-start items-end border-b-2 border-embracedark border-opacity-5 mb-12">
                <img
                  className="w-28 h-28 extrastyles-border-radius extrastyles-negmarg"
                  src="https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/iefz0rgodovf3fob6vja"
                />
                <div className="mb-6 ml-7">
                  <h1 className="font-semibold text-2xl">
                    Space View #{spaceId}
                  </h1>
                  <div className="w-full flex flex-row mt-1 text-sm">
                    <p className="underline font-semibold mt-4px">about</p>
                    <p className="text-embracedark text-opacity-50 mx-3  mt-4px">
                      &#124;
                    </p>
                    <p className="text-embracedark text-opacity-50  mt-4px">
                      founded by
                    </p>
                    <img
                      className="inline-block h-6 w-6-full rounded-3xl mx-3"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <p className="text-embracedark text-opacity-50  mt-4px">
                      Ox009...213
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
            {/* <Discussion /> */}
          </div>
        ) : (
          <>
            <Spinner />
          </>
        )}
      </AppLayout>
    </>
  );
}
