import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { Profile } from "../types/lens-generated";

export default function DropDown({
  title,
  items,
  onSelectItem,
}: {
  title: ReactNode;
  items: ReactElement[] | undefined;
  onSelectItem: (Profile) => void;
}) {
  const [show, setShow] = useState(false);

  const dropMenu = useRef<HTMLDivElement | null>(null);
  const closeOpenMenu = (e, show) => {
    if (dropMenu.current && show && !dropMenu.current?.contains(e.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", (e) => closeOpenMenu(e, show));

    return () => {
      document.removeEventListener("mousedown", (e) => closeOpenMenu(e, show));
    };
  }, [show]);

  return (
    <div ref={(ref) => (dropMenu.current = ref)} className="dropdown relative">
      <button
        className="dropdown-toggle px-6 py-2.5 bg-violet-500 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-violet-700 hover:shadow-lg focus:bg-violet-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-violet-700 active:shadow-lg active:text-white transition duration-150 ease-in-out flex items-center whitespace-nowrap"
        type="button"
        id="dropdownMenuButton1"
        data-bs-toggle="dropdown"
        aria-expanded={show}
        onClick={() => {
          if (items?.length === 0) return;

          setShow((prevState) => !prevState);
        }}
      >
        {title}

        <span className="ml-2">
          {show ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          )}
        </span>
      </button>

      <ul
        className={`dropdown-menu min-w-max absolute bg-white text-base z-50 float-left py-2 list-none text-left rounded-lg shadow-lg mt-1 m-0 bg-clip-padding border-none ${
          show ? "" : "hidden"
        }`}
        aria-labelledby="dropdownMenuButton1"
      >
        {items?.map((item) => {
          return (
            <li
              key={item.key}
              className="dropdown-item text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShow(false);
                onSelectItem(item);
              }}
            >
              {item}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
