import type { ComponentProps } from "react";

/** Sentrerer innholdet med maks bredde 1400 px og sidemarg. */
export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-page px-5 md:px-8 ${className}`} {...props} />;
}
