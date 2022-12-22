import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
} from "react";
import classNames from "classnames";

export default function Button({
  children,
  additionalClassName = "",
  buttonProps = {},
}: {
  children: ReactNode;
  additionalClassName?: string;
  buttonProps?: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
}) {
  return (
    <button
      className={classNames({
        "rounded-full border-violet-600 border-2 bg-transparent text-violet-600 shadow-sm focus:outline-none focus:ring-none font-semibold disabled:opacity-30 py-2 px-7":
          true,
        [additionalClassName]: additionalClassName,
      })}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
