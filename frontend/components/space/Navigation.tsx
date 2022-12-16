import Link from "next/link";
import { Space } from "../../types/space";
import { appMappings } from "../../lib/AppMappings";
import AppIcon from "../AppIcon";
import classNames from "classnames";

export default function Navigation({
  space,
  currentApp,
  setCurrentApp,
}: {
  space: Space;
  currentApp: number;
  setCurrentApp: (index: number) => void;
}) {
  return (
    <div className="w-full flex">
      <ul
        className="w-full flex mb-0 list-none flex-row pl-8 md:pl-[6.8vw]"
        role="tablist"
      >
        {Object.keys(appMappings).map((appId) => {
          const appIdNum = parseInt(appId); // map keys are strings
          const app = appMappings[appIdNum];

          if (!space?.apps.includes(appIdNum)) return null;

          return (
            <div className="-mb-px last:mr-0 text-center" key={appIdNum}>
              <Link
                href={`/embrace/${app.route}`}
                className={classNames({
                  "text-sm pl-4 pr-6 mr-8 py-3 block leading-normal": true,
                  "border-b-4 border-violet-600 font-semibold":
                    currentApp === appIdNum,
                  "font-normal": currentApp !== appIdNum,
                })}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentApp(appIdNum);
                }}
                data-toggle="tab"
                role="tablist"
              >
                <span className="flex items-center">
                  <AppIcon appId={appIdNum} />
                  <span> {app.title}</span>
                </span>
              </Link>
            </div>
          );
        })}
      </ul>
    </div>
  );
}
