import "easymde/dist/easymde.min.css";
import { Router } from "next/router";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import useGetDefaultProfile from "../../../hooks/lens/useGetDefaultProfile";
import useGetPublications from "../../../hooks/lens/useGetPublications";
import { useAppContract } from "../../../hooks/useEmbraceContracts";
import { SpaceSocial } from "../../../types/social";
import { Space } from "../../../types/space";
import SocialProfile from "./SocialProfile";
import SocialPublications from "./SocialPublications";

export enum PageState {
  Publications = "publications",
  Profile = "profile",
}

export default function Social({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const { appSocialsContract } = useAppContract();
  const { address } = useAccount();

  const [pageState, setPageState] = useState({
    type: PageState.Publications,
    data: "",
  });

  // general
  const [socialDetails, setSocialDetails] = useState<SpaceSocial>();

  const noLensSetup = socialDetails && !socialDetails.lensDefaultProfileId;

  const getSocials = useCallback(() => {
    appSocialsContract
      ?.getSocial(space.id)
      ?.then((socials) => setSocialDetails(socials as SpaceSocial))
      ?.catch((e: any) =>
        console.error(
          `An error occurred fetchin the socials contract, ${e.message}`,
        ),
      );
  }, [appSocialsContract, space.id]);

  useEffect(() => {
    getSocials();
  }, [getSocials]);

  useEffect(() => {
    // founder has to setup profile first
    if (
      address === space.founder &&
      noLensSetup &&
      pageState.type === PageState.Publications
    ) {
      setPageState({ type: PageState.Profile, data: "" });
    }
  }, [address, noLensSetup, pageState.type, socialDetails, space.founder]);

  const {
    defaultProfile,
    initialLoaded: initLoadedDefaultProfile,
    getDefaultProfile,
  } = useGetDefaultProfile({ ethereumAddress: address });

  const { publications, getPublications } = useGetPublications({
    profileId: socialDetails?.lensDefaultProfileId,
    // limit: 10,
  });

  function showContent() {
    let content: ReactElement | null = null;

    switch (pageState.type) {
      case PageState.Publications:
        content = (
          <SocialPublications
            {...{
              socialDetails,
              setPageState,
              space,
              publications,
              defaultProfile,
              getPublications,
            }}
          />
        );
        break;

      case PageState.Profile:
        content = (
          <SocialProfile
            {...{
              setPageState,
              space,
              socialDetails,
              defaultProfile,
              initLoadedDefaultProfile,
              getSocials,
              getDefaultProfile,
            }}
          />
        );
        break;
    }

    return content;
  }

  return <div className="w-full">{showContent()}</div>;
}
