import { Router, useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { appMappings } from "../../lib/AppMappings";
import { Space } from "../../types/space";
import Navigation from "./Navigation";

export default function Apps({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const prevSelectedApp = useRef(-1);
  const [currentApp, setCurrentApp] = useState(-1);

  const router = useRouter();

  // FIXME: Apps loading multiple times
  console.log("Apps LOADING multiple times", query);

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

    const appId = Object.keys(appMappings).findIndex(
      (appId) => appMappings[appId].route === query.app,
    );

    if (appId !== -1 && prevSelectedApp.current === appId) {
      // nothing changed
      return;
    }

    // Need to account for first render (-1)
    const selectedAppId = appId === -1 ? 0 : appId;

    // Load the route for the related appId
    const route = appMappings[selectedAppId].route;
    changeRouteShallowIfNew(route, false);

    // App cannot be found so select the first app as default
    setCurrentApp(selectedAppId);
    prevSelectedApp.current = selectedAppId;
  }, [changeRouteShallowIfNew, currentApp, query.app, router]);

  // Method to dynamically render the current app component
  const renderApp = () => {
    const Component = appMappings[currentApp].component;
    return <Component query={query} space={space} />;
  };

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
      <div className="w-full flex flex-col px-32 pt-14 justify-start items-start flex-1 bg-white">
        {currentApp !== -1 && renderApp()}
      </div>
    </div>
  );
}
