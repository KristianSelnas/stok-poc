import Link from "next/link";
import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "outlineLight";

const variants: Record<ButtonVariant, string> = {
  // Mørk blå tekst på grønn gir kontrast på ca. 5:1 (beslutning B13).
  primary: "bg-stok-green text-stok-blue hover:bg-stok-blue hover:text-white",
  secondary: "bg-stok-blue text-white hover:bg-stok-blue-dark",
  outline:
    "border-2 border-current text-stok-blue hover:border-stok-blue hover:bg-stok-blue hover:text-white",
  outlineLight: "border-2 border-white text-white hover:bg-white hover:text-stok-blue",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-meta text-base font-medium transition-colors";

/** Klasser for en knapp, til bruk på lenker som ikke er `ButtonLink` (f.eks. `CmsLink`). */
export function buttonClasses(variant: ButtonVariant = "primary", className = ""): string {
  return `${base} ${variants[variant]} ${className}`;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant };

export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
