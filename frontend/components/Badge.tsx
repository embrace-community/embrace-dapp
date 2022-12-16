import classNames from "classnames";
import { ReactNode } from "react";

export default function Badge({
  children,
  color,
  additonalClasses,
}: {
  children: ReactNode;
  color?: string;
  additonalClasses?: string;
}) {
  return (
    <span
      className={classNames({
        "inline-flex items-center rounded-md  px-2.5 py-0.5 text-xs font-medium pointer-events-none m-2 ml-0":
          true,
        "bg-gray-100 text-gray-800": !color?.length,
        [`bg-purple-100 text-purple-800`]: color === "purple",
        [`bg-green-100 text-green-800`]: color === "green",
        [`bg-red-100 text-red-800`]: color === "red",
        [`bg-yellow-100 text-yellow-800`]: color === "yellow",
        [`bg-blue-100 text-blue-800`]: color === "blue",
        [`${additonalClasses}`]: additonalClasses?.length,
      })}
    >
      {children}
    </span>
  );
}
