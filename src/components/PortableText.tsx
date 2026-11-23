import { PortableText as BasePortableText, type PortableTextComponents } from "next-sanity";

import type { MarketId } from "@/lib/markets";
import type { Image, Link, RichTextContent, SimpleTextContent } from "@/sanity/types";

import { CmsLink } from "./ui/CmsLink";
import { ContentImage } from "./ui/ContentImage";

type PortableTextProps = {
  value: RichTextContent | SimpleTextContent | null | undefined;
  market: MarketId;
  className?: string;
};

/** Rendrer rik tekst fra Sanity med STOK-typografi. */
export function PortableText({ value, market, className = "" }: PortableTextProps) {
  if (!value?.length) return null;

  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => <p className="leading-relaxed">{children}</p>,
      lead: ({ children }) => <p className="text-xl leading-relaxed text-stok-blue">{children}</p>,
      h2: ({ children }) => <h2 className="mt-10 text-3xl first:mt-0">{children}</h2>,
      h3: ({ children }) => <h3 className="mt-8 text-2xl first:mt-0">{children}</h3>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-stok-green pl-5 text-xl text-stok-blue italic">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="list-disc space-y-2 pl-6 marker:text-stok-green-dark">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal space-y-2 pl-6 marker:text-stok-green-dark">{children}</ol>
      ),
    },
    marks: {
      linkAnnotation: ({ value: mark, children }) => (
        <CmsLink
          link={mark as Link}
          market={market}
          className="font-medium text-stok-blue underline decoration-stok-green decoration-2 underline-offset-4 hover:decoration-stok-blue"
        >
          {children}
        </CmsLink>
      ),
    },
    types: {
      imageWithAlt: ({ value: image }) => (
        <figure className="my-8">
          <ContentImage
            image={image as Image}
            sizes="(min-width: 768px) 768px, 100vw"
            className="h-auto w-full rounded-3xl"
          />
        </figure>
      ),
    },
  };

  return (
    <div className={`space-y-5 ${className}`}>
      <BasePortableText value={value} components={components} />
    </div>
  );
}
