import { Router, useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appMappings } from "../../lib/AppMappings";
import { Access, Space, SpaceMembership, Visibility } from "../../types/space";
import Navigation from "./Navigation";
import RenderCurrentApp from "../app/RenderCurrentApp";
import { BigNumber } from "ethers";

export default function Apps({
  query,
  space,
  accountMembership,
}: {
  query: Router["query"];
  space: Space;
  accountMembership: SpaceMembership | undefined;
}) {
  const prevSelectedApp = useRef(-1);
  const [currentApp, setCurrentApp] = useState(-1);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!space?.membership) return;

    setLoaded(true);
  }, [accountMembership, query.app, space?.membership]);

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

  // Set initial app
  useEffect(() => {
    if (!query.app) return;

    try {
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
      // const route = appMappings[selectedAppId]?.route;
      // if (!route) return;

      // No need to route to app on first load - causes issues e.g. cannot go back to space page / changes /home used on load for every space route
      //changeRouteShallowIfNew(route, false);

      // App cannot be found so select the first app as default
      setCurrentApp(selectedAppId);
      prevSelectedApp.current = selectedAppId;
    } catch (e) {
      console.error("Error: ", e);
    }
  }, [changeRouteShallowIfNew, currentApp, query.app, router, space?.apps]);

  function onAppChange(appId: number) {
    // Load the route for the current App
    const route = appMappings[appId].route;
    changeRouteShallowIfNew(route);
  }

  return (
    <div className="w-full flex flex-col items-start flex-1">
      <Navigation
        space={space}
        currentApp={currentApp}
        setCurrentApp={onAppChange}
      />

      <div className="w-full flex flex-col px-4 py-6 sm:px-28 sm:py-6 justify-start items-start flex-1 bg-white">
        {/* If space access is private or anonymouse then they must be a member to view the app content */}
        {(space.visibility === Visibility.PRIVATE ||
          space.visibility === Visibility.ANONYMOUS) &&
          (!accountMembership?.isActive || !accountMembership) &&
          loaded && (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-center mt-4">
                You must be a member to view this space
              </div>
            </div>
          )}

        {(space.visibility === Visibility.PUBLIC ||
          accountMembership?.isActive) &&
          loaded &&
          currentApp !== -1 && (
            <RenderCurrentApp
              currentApp={currentApp}
              query={query}
              space={space}
              accountMembership={accountMembership}
            />
          )}
      </div>
    </div>
  );
}
