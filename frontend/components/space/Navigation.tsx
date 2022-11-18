import Link from "next/link";
import { EmbraceSpace } from "../../types/space";
import { appMappings } from "../../lib/AppMappings";

export default function Navigation({
  space,
  currentApp,
  setCurrentApp,
}: {
  space: EmbraceSpace;
  currentApp: number;
  setCurrentApp: (index: number) => void;
}) {
  return (
    <div className="flex">
      <div className="w-full">
        <ul
          className="flex mb-0 list-none flex-row extrastyles-specialpadding2"
          role="tablist"
        >
          {Object.keys(appMappings).map((appId) => {
            const appIdNum = parseInt(appId); // map keys are strings
            const app = appMappings[appIdNum];

            if (!space.apps.includes(appIdNum)) return null;

            return (
              <div className="-mb-px last:mr-0 text-center" key={appIdNum}>
                <Link
                  href={`/embrace/${app.route}`}
                  className={
                    "text-sm mr-12 py-3 block leading-normal " +
                    (currentApp === appIdNum
                      ? "border-b-4 border-violet-500 font-semibold"
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
    </div>
  );
}
