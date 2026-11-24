import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";
import { documentHref } from "@/lib/links";
import { marketPath, type MarketId } from "@/lib/markets";
import { routePrefixes } from "@/lib/routes";
import type { Product } from "@/sanity/types";

import { PortableText } from "../PortableText";
import { buttonClasses } from "../ui/Button";
import { Container } from "../ui/Container";
import { ContentImage } from "../ui/ContentImage";
import { ProductCardGrid } from "../ui/ProductCard";

/** Kontaktsiden per marked. Flyttes til Innstillinger hvis redaktørene vil styre den. */
const contactPaths: Record<MarketId, string> = { no: "/kontakt", is: "/hafa-samband" };

/**
 * Produktside: bilder til venstre, navn, beskrivelse, materialer, bransjer og
 * kontaktknapp til høyre. Under kommer egenskaper, lang beskrivelse og
 * relaterte produkter (valgt manuelt, ellers andre i samme gruppe).
 */
export function ProductPage({
  product,
  market,
  shopHref,
}: {
  product: Product;
  market: MarketId;
  /** Lenke til produktet i nettbutikken, når det finnes der. */
  shopHref?: string;
}) {
  const t = getDictionary(market);
  const catalogHref = marketPath(market, `/${routePrefixes.product[market]}`);
  const images = (product.images ?? []).filter((image) => image.url);
  const [mainImage, ...moreImages] = images;
  const manualRelated = (product.relatedProducts ?? []).filter(Boolean);
  const related = manualRelated.length ? manualRelated : (product.sameGroup ?? []);
  const industries = (product.industries ?? []).filter(Boolean);
  const materials = (product.materials ?? []).filter(Boolean);

  return (
    <>
      <section className="bg-stok-light">
        <Container className="py-10 md:py-14">
          <nav aria-label={t.breadcrumbs} className="mb-8 font-meta text-sm">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={catalogHref} className="text-stok-blue hover:underline">
                  {t.products}
                </Link>
              </li>
              {product.group?.title && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={product.group.slug ? `${catalogHref}?gruppe=${product.group.slug}` : catalogHref}
                      className="text-stok-blue hover:underline"
                    >
                      {product.group.title}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-stok-text">
                {product.title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white">
                {mainImage ? (
                  <ContentImage
                    image={mainImage}
                    fill
                    preload
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain p-8"
                  />
                ) : null}
              </div>
              {moreImages.length > 0 && (
                <ul className="mt-4 grid grid-cols-4 gap-3">
                  {moreImages.slice(0, 4).map((image) => (
                    <li
                      key={image._key}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-white"
                    >
                      <ContentImage image={image} fill sizes="120px" className="object-contain p-2" />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              {product.group?.title && (
                <p className="mb-2 font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
                  {product.group.title}
                </p>
              )}
              <h1 className="text-4xl md:text-5xl">{product.title}</h1>
              {product.shortDescription && <p className="mt-5 text-xl">{product.shortDescription}</p>}

              {materials.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 font-meta text-sm font-medium text-stok-blue">{t.material}</h2>
                  <ul className="flex flex-wrap gap-2">
                    {materials.map((material) => (
                      <li
                        key={material._id}
                        className="rounded-full bg-white px-3 py-1 text-sm text-stok-blue"
                      >
                        {material.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {industries.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 font-meta text-sm font-medium text-stok-blue">{t.usedIn}</h2>
                  <ul className="flex flex-wrap gap-2">
                    {industries.map((industry) => {
                      const href = documentHref("industry", industry.slug, market);
                      return (
                        <li key={industry._id}>
                          {href ? (
                            <Link
                              href={href}
                              className="inline-block rounded-full bg-stok-green/20 px-3 py-1 text-sm text-stok-blue hover:bg-stok-green/40"
                            >
                              {industry.title}
                            </Link>
                          ) : (
                            industry.title
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-4">
                {shopHref && (
                  <Link href={shopHref} className={buttonClasses("secondary")}>
                    {t.seeInShop}
                  </Link>
                )}
                <Link href={marketPath(market, contactPaths[market])} className={buttonClasses("primary")}>
                  {t.askAboutProduct}
                </Link>
                {product.datasheetUrl && (
                  <a
                    href={product.datasheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("outline")}
                  >
                    {t.datasheet}
                  </a>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {(product.description?.length || product.properties?.length) && (
        <section className="py-14 md:py-20">
          <Container className="grid gap-12 lg:grid-cols-[3fr_2fr]">
            <PortableText value={product.description} market={market} className="max-w-3xl text-lg" />
            {!!product.properties?.length && (
              <div>
                <h2 className="mb-4 text-2xl">{t.properties}</h2>
                <dl className="divide-y divide-stok-blue/10 rounded-3xl bg-stok-light px-6">
                  {product.properties.map((property) => (
                    <div key={property._key} className="grid grid-cols-2 gap-4 py-3">
                      <dt className="font-semibold text-stok-blue">{property.key}</dt>
                      <dd>{property.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-stok-light py-14 md:py-20">
          <Container>
            <h2 className="mb-10 text-3xl">{t.relatedProducts}</h2>
            <ProductCardGrid products={related.slice(0, 4)} market={market} />
          </Container>
        </section>
      )}
    </>
  );
}
