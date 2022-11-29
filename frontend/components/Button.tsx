import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
} from "react";

export default function Button({
  children,
  additionalClassName = "",
  buttonProps,
}: {
  children: ReactNode;
  additionalClassName?: string;
  buttonProps: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
}) {
  return (
    <button
      className={`rounded-full border-violet-500 border-2 bg-transparent text-violet-500 shadow-sm focus:outline-none focus:ring-none font-semibold disabled:opacity-30  ${additionalClassName}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
