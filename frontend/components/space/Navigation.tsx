import Link from "next/link";
import { Space } from "../../types/space";
import { appMappings } from "../../lib/AppMappings";
import AppIcon from "../AppIcon";
import classNames from "classnames";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

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
        className="hidden md:flex after:w-full mb-0 list-none flex-row pl-8 md:pl-[6.8vw]"
        role="tablist"
      >
        {Object.keys(appMappings).map((appId) => {
          const appIdNum = parseInt(appId); // map keys are strings
          const app = appMappings[appIdNum];

          if (!space?.apps.includes(appIdNum)) return null;

          return (
            <div className="flex -mb-px last:mr-0 text-center" key={appIdNum}>
              <Link
                href={`/embrace/${app.route}`}
                className={classNames({
                  "text-sm pl-4 pr-6 mr-8 pb-3 block leading-normal": true,
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

      <Menu
        as="div"
        className="inline-block md:hidden w-full relative text-left mb-4 mx-4"
      >
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
            {currentApp !== -1 && (
              <span className="flex items-center">
                <AppIcon appId={currentApp} />
                <span className="ml-3">{appMappings[currentApp].title}</span>
              </span>
            )}
            <ChevronDownIcon
              className="-mr-1 ml-2 h-5 w-5 mt-2"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="w-full justify-start items-start z-10 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {Object.keys(appMappings).map((appId) => {
              const appIdNum = parseInt(appId); // map keys are strings
              const app = appMappings[appIdNum];

              if (!space?.apps.includes(appIdNum)) return null;

              return (
                <Menu.Item key={appIdNum + "mobile-nav"}>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm",
                      )}
                      onClick={(e) => {
                        setCurrentApp(appIdNum);
                      }}
                    >
                      <AppIcon appId={appIdNum} />
                      <span className="ml-3">{app.title}</span>
                    </a>
                  )}
                </Menu.Item>
              );
            })}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
