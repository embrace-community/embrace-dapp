import Link from "next/link";
import { Space } from "../../types/space";
import { appMappings } from "../../lib/AppMappings";

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
        className="w-full flex mb-0 list-none flex-row extrastyles-specialpadding2"
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
                className={
                  "text-sm mr-12 py-3 block leading-normal " +
                  (currentApp === appIdNum
                    ? "border-b-4 border-violet-700 font-semibold"
                    : "font-normal")
                }
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentApp(appIdNum);
                }}
                data-toggle="tab"
                role="tablist"
              >
                {app.title}
              </Link>
            </div>
          );
        })}
      </ul>
    </div>
  );
}
