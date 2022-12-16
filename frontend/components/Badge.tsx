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
        [`bg-${color}-100 text-${color}-800`]: color?.length,
        [`${additonalClasses}`]: additonalClasses?.length,
      })}
    >
      {children}
    </span>
  );
}
