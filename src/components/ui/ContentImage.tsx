import NextImage from "next/image";
import { Image as SanityImage } from "next-sanity/image";

import type { Image } from "@/sanity/types";

type ContentImageProps = {
  image: Image | null | undefined;
  sizes: string;
  className?: string;
  /** Fyller forelderen (som må ha `position: relative` og en høyde). */
  fill?: boolean;
  preload?: boolean;
};

/**
 * Viser et bilde fra Sanity (via Sanitys bilde-CDN) eller et lokalt
 * reservebilde fra `public/`. Hotspot fra Studio styrer utsnittet.
 */
export function ContentImage({ image, sizes, className, fill = false, preload = false }: ContentImageProps) {
  if (!image?.url) return null;

  const alt = image.alt ?? "";
  const objectPosition = image.hotspot
    ? `${(image.hotspot.x ?? 0.5) * 100}% ${(image.hotspot.y ?? 0.5) * 100}%`
    : undefined;
  const sizing = fill
    ? { fill: true as const }
    : { width: image.width ?? undefined, height: image.height ?? undefined };

  if (image.url.startsWith("https://cdn.sanity.io/")) {
    return (
      <SanityImage
        src={image.url}
        alt={alt}
        sizes={sizes}
        className={className}
        preload={preload}
        style={objectPosition ? { objectPosition } : undefined}
        placeholder={image.lqip ? "blur" : undefined}
        blurDataURL={image.lqip ?? undefined}
        {...sizing}
      />
    );
  }

  return (
    <NextImage
      src={image.url}
      alt={alt}
      sizes={sizes}
      className={className}
      preload={preload}
      style={objectPosition ? { objectPosition } : undefined}
      {...sizing}
    />
  );
}
