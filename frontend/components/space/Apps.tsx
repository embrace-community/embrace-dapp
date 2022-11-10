import Link from "next/link";
import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { EmbraceSpace } from "../../utils/types";
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

  // On first render, if there is an app in the query then set the current app to that app
  useEffect(() => {
    if (query.app && !appSelected) {
      const appIndex = Object.keys(appMappings).findIndex(
        (appIndex) => appMappings[appIndex].appRoute === query.app
      );

      // TODO
      console.log("TODO: App currently rendering multiple time");

      // App cannot be found so select the first app as default
      if (appIndex === -1) {
        setCurrentApp(0);
      } else {
        setCurrentApp(appIndex);
      }

      setAppSelected(true);
    }
  }, []);

  // Method to dynamically render the current app component
  const renderApp = () => {
    const Component = appMappings[currentApp].component;
    return <Component query={query} space={space} />;
  };

  //   Whenever the current app changes then update the URI to reflect the new app
  useEffect(() => {
    const appRoute = appMappings[currentApp].appRoute;
    router.push(`/${router.query.handle}/${appRoute}`, undefined, {
      shallow: true,
    });
  }, [currentApp]);

  return (
    <>
      <Navigation
        space={space}
        currentApp={currentApp}
        setCurrentApp={setCurrentApp}
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
