import Link from "next/link";
import type { ReactNode } from "react";

import { isExternal, resolveHref } from "@/lib/links";
import type { MarketId } from "@/lib/markets";
import type { Link as LinkValue } from "@/sanity/types";

type CmsLinkProps = {
  link: Pick<LinkValue, "linkType" | "path" | "url" | "internal"> & { label?: string | null };
  market: MarketId;
  className?: string;
  children?: ReactNode;
};

/** Lenke fra Sanity. Eksterne lenker åpnes i ny fane. Lenker uten mål vises som tekst. */
export function CmsLink({ link, market, className, children }: CmsLinkProps) {
  const href = resolveHref(link, market);
  const content = children ?? link.label;
  if (!href) return <span className={className}>{content}</span>;

  if (isExternal(link) && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  if (isExternal(link)) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
