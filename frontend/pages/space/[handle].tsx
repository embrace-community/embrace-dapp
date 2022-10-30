import AppLayout from "../../components/AppLayout";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { SpaceContext } from "../../lib/SpaceContext";
import Discussion from "../../components/app/discussion";
import { ethers } from "ethers";
import embraceSpacesContract from "../../data/contractArtifacts/EmbraceSpaces.json";
import Link from "next/link";
import { useSigner } from "wagmi";
import ClientOnlyWrapper from "../../components/ClientOnlyWrapper";

export default function SpaceViewPage() {
  const [spaceId, setSpaceId] = useContext(SpaceContext);
  const [spaceData, setSpaceData] = useState<any>(null);
  const { data: signer } = useSigner();
  const router = useRouter();
  const routerIsReady = router.isReady;

  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_SPACES_CONTRACT_ADDRESS!,
    embraceSpacesContract.abi,
    signer
  );
  const [openTab, setOpenTab] = useState(1);

  useEffect((): void => {
    if (!contract || !routerIsReady) return;

    async function getSpaceId(MyContract): Promise<void> {
      try {
        const handleBytes32 = ethers.utils.formatBytes32String(
          router.query.handle as string
        );
        const response = await MyContract.getIdFromHandle(handleBytes32);
        if (response.toString() !== "0") {
          setSpaceId(Number(response.toString()));
        }
      } catch (err) {
        console.log(err);
      }
    }

    getSpaceId(contract);
  }, [contract, routerIsReady]);

  useEffect((): void => {
    if (!contract || !routerIsReady || spaceId == -1) return;

    console.log(contract, routerIsReady, spaceId);

    async function getSpace(MyContract): Promise<void> {
      try {
        const response = await MyContract.getSpace(spaceId);
        // Now we have the space data, we need to get the metadata from IPFS
        // and merge with the response
        console.log(response);
        setSpaceData(response);
      } catch (err) {
        console.log(err);
      }
    }

    getSpace(contract);
  }, [spaceId]);


  const tabs = [
    { name: 'My Account', href: '#', current: false },
    { name: 'Company', href: '#', current: false },
    { name: 'Team Members', href: '#', current: true },
    { name: 'Billing', href: '#', current: false },
  ]
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
const jimmysdummycontent = [
  {
  label: 'discussion',
  appnumber: 1
  },
  {
    label: 'proposals',
    appnumber: 2
  },
  {
    label: 'chat',
    appnumber: 3
  },
  {
    label: 'members',
    appnumber: 4
  },
]

  return (
    <>
      <AppLayout title="Get Space Name from Handle">
        {spaceId !== -1 ? (
          <>
          <div className="w-full flex flex-col justify-start text-embracedark extrastyles-specialpadding">
            <div className="w-full flex flex-row justify-start items-end border-b-2 border-embracedark border-opacity-20 mb-12">
              <img className="w-28 h-28 extrastyles-border-radius extrastyles-negmarg" src="https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/iefz0rgodovf3fob6vja" />
              <div className="mb-6 ml-7">
                <h1 className="font-semibold text-2xl">Space View #{spaceId}</h1>
                <div className="w-full flex flex-row mt-1 text-sm">
                  <p className="underline font-semibold mt-4px">about</p>
                  <p className="text-embracedark text-opacity-50 mx-3  mt-4px">&#124;</p>
                  <p className="text-embracedark text-opacity-50  mt-4px">founded by</p>
                  <img
                    className="inline-block h-6 w-6-full mx-3"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <p className="text-embracedark text-opacity-50  mt-4px">Ox009...213</p>
                </div>
              </div>
            </div>                      
          </div>
          
          <div className="flex">
            <div className="w-full">
              <ul
                className="flex mb-0 list-none flex-row extrastyles-specialpadding"
                role="tablist"
              >
                {jimmysdummycontent.map(app => {
                  return (
                    <li className="-mb-px last:mr-0 text-center">
                      <a
                        className={
                          "text-sm mr-12 py-3 block leading-normal " +
                          (openTab === app.appnumber
                            ? "border-b-4 border-violet-500 font-semibold"
                            : "font-normal")
                        }
                        onClick={e => {
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
                  )
                })}
              </ul>
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6">
                <div className="px-4 py-5 flex-auto">
                  <div className="tab-content tab-space">
                    <div className={openTab === 1 ? "block" : "hidden"} id="link1">
                      <p>This is 1</p>
                    </div>
                    <div className={openTab === 2 ? "block" : "hidden"} id="link2">
                      <p>
                        Completely synergize resource taxing relationships via
                        premier niche markets. Professionally cultivate one-to-one
                        customer service with robust ideas.
                        <br />
                        <br />
                        Dynamically innovate resource-leveling customer service for
                        state of the art customer service.
                      </p>
                    </div>
                    <div className={openTab === 3 ? "block" : "hidden"} id="link3">
                      <p>
                        Efficiently unleash cross-media information without
                        cross-media value. Quickly maximize timely deliverables for
                        real-time schemas.
                        <br />
                        <br /> Dramatically maintain clicks-and-mortar solutions
                        without functional solutions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>
            {/* <Discussion /> */}
          </>
        ) : (
          <></>
        )}
      </AppLayout>
    </>
  );
}
