import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline";

const variants: Record<Variant, string> = {
  // Mørk blå tekst på grønn gir kontrast på ca. 5:1 (beslutning B13).
  primary: "bg-stok-green text-stok-blue hover:bg-stok-blue hover:text-white",
  secondary: "bg-stok-blue text-white hover:bg-stok-blue-dark",
  outline:
    "border-2 border-current text-stok-blue hover:bg-stok-blue hover:text-white hover:border-stok-blue",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-meta text-base font-medium transition-colors";

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
