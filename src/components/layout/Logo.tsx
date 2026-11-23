import Image from "next/image";
import Link from "next/link";

import logo from "../../../public/brand/stok-emballage-logo.png";

type LogoProps = {
  href: string;
  label: string;
  /** Hvit versjon til mørk bakgrunn. */
  inverted?: boolean;
  className?: string;
};

export function Logo({ href, label, inverted = false, className = "" }: LogoProps) {
  return (
    <Link href={href} aria-label={label} className={`inline-block shrink-0 ${className}`}>
      <Image
        src={logo}
        alt=""
        preload={!inverted}
        sizes="160px"
        className={`h-auto w-full ${inverted ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}
