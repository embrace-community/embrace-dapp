import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { EmbraceSpace } from "../../types/space";
import { appMappings } from "../../lib/AppMappings";
import Navigation from "./Navigation";

export default function Apps({
  query,
  space,
}: {
  query: Router["query"];
  space: EmbraceSpace;
}) {
  const [currentApp, setCurrentApp] = useState(0);
  const [appSelected, setAppSelected] = useState(false);
  const router = useRouter();

  // FIXME: Apps loading multiple times
  console.log("Apps LOADING multiple times", query);

  // On first render, if there is an app in the query then set the current app to that app
  useEffect(() => {
    if (!query.app || appSelected) return;

    const appId = Object.keys(appMappings).findIndex(
      (appId) => appMappings[appId].route === query.app
    );

    // App cannot be found so select the first app as default
    if (appId === -1) {
      setCurrentApp(0);
    } else {
      setCurrentApp(appId);
    }

    setAppSelected(true);
  }, []);

  // Method to dynamically render the current app component
  const renderApp = () => {
    const Component = appMappings[currentApp].component;
    return <Component query={query} space={space} />;
  };

  // Whenever the current app changes then update the URI to reflect the new app
  useEffect(() => {
    if (appSelected) {
      // Load the route for the current App
      const route = appMappings[currentApp].route;
      // Update the router to reflect the new app
      router.query.app = route;

      // Change the route URL without reloading the page
      router.push(router, undefined, {
        shallow: true,
      });
    }
  }, [currentApp]);

  // This ensures query params are removed when changing pages
  // I.e. /discussions?id=1223: id should be removed when switching to /proposals
  const setApp = (newApp: number) => {
    if (appSelected) {
      // If the newly selected app differs from the current app then remove the query params
      if (newApp !== currentApp) {
        // Reset the query params
        router.query = {
          handle: router.query.handle,
          app: router.query.app,
        };
      }

      // Set current app
      setCurrentApp(newApp);
    }
  };

  return (
    <>
      <Navigation
        space={space}
        currentApp={currentApp}
        setCurrentApp={setApp}
      />
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full">
        <div className="tab-content tab-space">
          <div className="block">
            <div className="flex flex-col w-full pl-32 pt-14 justify-start items-start">
              {appSelected && renderApp()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
