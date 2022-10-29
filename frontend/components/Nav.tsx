import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAccount, useDisconnect, Web3Button } from "@web3modal/react";

const navigation = [
  { name: "Home", routes: ["/"], href: "/" },
  { name: "Space", routes: ["/space/create"], href: "/space/create" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Nav() {
  const currentRoute = useRouter().pathname;
  const { account } = useAccount();
  const disconnect = useDisconnect();

  return (
    <Disclosure
      as="nav"
      className="bg-gradient-to-r from-purple-800 to-indigo-700"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">Logo</div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.routes.includes(currentRoute.toLowerCase())
                            ? "bg-slate-100 text-indigo-700"
                            : "text-white hover:bg-slate-100 hover:text-indigo-700",
                          "px-3 py-2 rounded-md text-sm font-medium"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {account.isConnected ? (
                    <>
                      <span className="text-slate-100">
                        {account?.address.slice(0, 6) +
                          "..." +
                          account?.address.slice(-4)}
                      </span>
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-indigo-600 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                            <img
                              className="h-8 w-8 rounded-full"
                              src="https://api.multiavatar.com/Binx Bond.svg"
                              alt=""
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
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                              <a
                                href="#"
                                className={classNames(
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                Your Account
                              </a>
                            </Menu.Item>
                            <Menu.Item>
                              <a
                                href="#"
                                onClick={() => disconnect()}
                                className={classNames(
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                Disconnect
                              </a>
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <Web3Button />
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.routes.includes(currentRoute.toLowerCase())
                      ? "bg-slate-100 text-indigo-700"
                      : "text-white hover:bg-slate-100 hover:text-indigo-700",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-indigo-700 pt-4 pb-3">
              <div className="flex items-center px-5">
                {account.isConnected ? (
                  <>
                    <span className="text-slate-100">
                      {account?.address.slice(0, 6) +
                        "..." +
                        account?.address.slice(-4)}
                    </span>

                    <img
                      className="h-8 w-8 rounded-full ml-3"
                      src="https://api.multiavatar.com/Binx Bond.svg"
                      alt=""
                    />
                  </>
                ) : (
                  <Web3Button />
                )}
              </div>
              {account.isConnected ? (
                <div className="mt-3 space-y-1 px-2">
                  <Disclosure.Button
                    as="a"
                    href="#"
                    className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                  >
                    Your account
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      disconnect();
                    }}
                    className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                  >
                    Disconnect
                  </Disclosure.Button>
                </div>
              ) : null}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
