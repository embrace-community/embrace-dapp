import { Router, useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appMappings } from "../../lib/AppMappings";
import { Space, SpaceMembership } from "../../types/space";
import Navigation from "./Navigation";
import RenderCurrentApp from "../app/RenderCurrentApp";
import { BigNumber } from "ethers";

export default function Apps({
  query,
  space,
  membership,
}: {
  query: Router["query"];
  space: Space;
  membership: SpaceMembership | undefined;
}) {
  const prevSelectedApp = useRef(-1);
  const [currentApp, setCurrentApp] = useState(-1);

  const router = useRouter();

  const changeRouteShallowIfNew = useCallback(
    (route: string, removeParams = true) => {
      if (router.query?.app !== route) {
        // Update the router to reflect the new app
        router.query.app = route;

        // Reset the query params
        if (removeParams)
          router.query = {
            handle: router.query.handle,
            app: router.query.app,
          };

        const newUrl = `/${router.query.handle}/${router.query.app}`;

        // Change the route URL without reloading the page
        router.push(newUrl, undefined, { shallow: true });
      }
    },
    [router],
  );

  useEffect(() => {
    if (!query.app) return;

    // See if the appId can be found using the route
    const appId = Number(
      Object.keys(appMappings).find(
        (appId) => appMappings[appId].route === query.app,
      ),
    );

    // Current app already selected
    if (appId !== -1 && prevSelectedApp.current === appId) {
      // nothing changed
      return;
    }

    // Need to account for first render (-1)
    // Will select the first app that the space has installed
    const spaceApps = space?.apps;
    if (spaceApps.length === 0) {
      alert(
        "There was a problem loading the space apps. Please try again later.",
      );
      return;
    }

    // Convert each of the appIds to numbers and sort in order o appId for now
    const appIds = spaceApps
      .map((appId) => BigNumber.from(appId).toNumber())
      .sort();

    const selectedAppId = appId === -1 || isNaN(appId) ? appIds[0] : appId;

    // Load the route for the related appId
    const route = appMappings[selectedAppId].route;
    changeRouteShallowIfNew(route, false);

    // App cannot be found so select the first app as default
    setCurrentApp(selectedAppId);
    prevSelectedApp.current = selectedAppId;
  }, [changeRouteShallowIfNew, currentApp, query.app, router, space?.apps]);

  function onAppChange(appId: number) {
    // Load the route for the current App
    const route = appMappings[appId].route;
    changeRouteShallowIfNew(route);
  }

  console.log("Apps.tsx: ", currentApp);

  return (
    <div className="w-full flex flex-col items-start flex-1">
      <Navigation
        space={space}
        currentApp={currentApp}
        setCurrentApp={onAppChange}
      />
      <div className="w-full flex flex-col px-4 py-6 sm:px-28 sm:py-6 justify-start items-start flex-1 bg-white">
        {currentApp !== -1 && (
          <RenderCurrentApp
            currentApp={currentApp}
            query={query}
            space={space}
            membership={membership}
          />
        )}
      </div>
    </div>
  );
}
