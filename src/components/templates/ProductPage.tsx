import Image from "next/image";
import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";
import { documentHref } from "@/lib/links";
import { marketPath, type MarketId } from "@/lib/markets";
import { type ProductCardData, type SiteProduct } from "@/lib/products";
import { routePrefixes } from "@/lib/routes";

import { buttonClasses } from "../ui/Button";
import { Container } from "../ui/Container";
import { ProductCardGrid } from "../ui/ProductCard";

/** Kontaktsiden per marked. Flyttes til Innstillinger hvis redaktørene vil styre den. */
const contactPaths: Record<MarketId, string> = { no: "/kontakt", is: "/hafa-samband" };

/**
 * Produktside med data fra produktkatalogen (fase N): bilder til venstre,
 * navn, beskrivelse, materialer, produktgrupper og knapper til høyre. Under
 * kommer beskrivelse, fordeler, varianttabell og andre produkter av samme type.
 */
export function ProductPage({
  data,
  related,
  market,
  shopHref,
}: {
  data: SiteProduct;
  related: ProductCardData[];
  market: MarketId;
  /** Lenke til produktet i nettbutikken, når det finnes der. */
  shopHref?: string;
}) {
  const { product, type, groups, materials } = data;
  const t = getDictionary(market);
  const catalogHref = marketPath(market, `/${routePrefixes.product[market]}`);
  const images = product.images.length
    ? product.images
    : product.variants.flatMap((v) => v.image ?? []).slice(0, 1);
  const [mainImage, ...moreImages] = images;
  const attributeLabels = [
    ...new Map(product.variants.flatMap((v) => v.attributes.map((a) => [a.key, a.label]))).entries(),
  ];

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
              {type && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={`${catalogHref}?type=${type.slug}`}
                      className="text-stok-blue hover:underline"
                    >
                      {type.title}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-stok-text">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white">
                {mainImage && (
                  <Image
                    src={mainImage.url}
                    alt={mainImage.alt}
                    fill
                    preload
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain p-8"
                  />
                )}
              </div>
              {moreImages.length > 0 && (
                <ul className="mt-4 grid grid-cols-4 gap-3">
                  {moreImages.slice(0, 4).map((image) => (
                    <li
                      key={image.url}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-white"
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="120px"
                        className="object-contain p-2"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              {type && (
                <p className="mb-2 font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
                  {type.title}
                </p>
              )}
              <h1 className="text-4xl md:text-5xl">{product.name}</h1>
              {product.shortDescription && <p className="mt-5 text-xl">{product.shortDescription}</p>}

              {materials.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 font-meta text-sm font-medium text-stok-blue">{t.material}</h2>
                  <ul className="flex flex-wrap gap-2">
                    {materials.map((material) => (
                      <li
                        key={material.slug}
                        className="rounded-full bg-white px-3 py-1 text-sm text-stok-blue"
                      >
                        {material.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {groups.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 font-meta text-sm font-medium text-stok-blue">{t.usedIn}</h2>
                  <ul className="flex flex-wrap gap-2">
                    {groups.map((group) => {
                      // Bransjesiden når gruppen har en, ellers katalogen filtrert på gruppen.
                      const href =
                        documentHref("industry", group.industry, market) ??
                        `${catalogHref}?gruppe=${group.slug}`;
                      return (
                        <li key={group.slug}>
                          <Link
                            href={href}
                            className="inline-block rounded-full bg-stok-green/20 px-3 py-1 text-sm text-stok-blue hover:bg-stok-green/40"
                          >
                            {group.title}
                          </Link>
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

      {(product.description.length > 0 || product.benefits.length > 0) && (
        <section className="py-14 md:py-20">
          <Container className="grid gap-12 lg:grid-cols-[3fr_2fr]">
            <div className="max-w-3xl space-y-4 text-lg">
              {product.description.map((block, i) =>
                block.type === "h" ? (
                  <h2 key={i} className="pt-2 text-2xl md:text-3xl">
                    {block.text}
                  </h2>
                ) : block.type === "p" ? (
                  <p key={i}>{block.text}</p>
                ) : (
                  <ul key={i} className="list-disc space-y-1 pl-6">
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
            {product.benefits.length > 0 && (
              <div>
                <h2 className="mb-4 text-2xl">{t.benefits}</h2>
                <dl className="divide-y divide-stok-blue/10 rounded-3xl bg-stok-light px-6">
                  {product.benefits.map((benefit) => (
                    <div key={benefit.title} className="py-3">
                      <dt className="font-semibold text-stok-blue">{benefit.title}</dt>
                      <dd>{benefit.text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Container>
        </section>
      )}

      {attributeLabels.length > 0 && (
        <section className="bg-stok-light py-14 md:py-20">
          <Container>
            <h2 className="mb-6 text-3xl">{t.variants}</h2>
            <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stok-blue/10">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="bg-stok-blue text-white">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      {t.sku}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t.variant}
                    </th>
                    {attributeLabels.map(([key, label]) => (
                      <th key={key} scope="col" className="px-4 py-3">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stok-blue/10">
                  {product.variants.map((v) => (
                    <tr key={v.sku}>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap text-stok-blue">{v.sku}</td>
                      <td className="px-4 py-3">{v.name}</td>
                      {attributeLabels.map(([key]) => (
                        <td key={key} className="px-4 py-3">
                          {v.attributes.find((a) => a.key === key)?.value ?? "–"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {product.note && <p className="mt-4">{product.note}</p>}
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section className={`${attributeLabels.length ? "" : "bg-stok-light"}py-14 md:py-20`}>
          <Container>
            <h2 className="mb-10 text-3xl">{t.relatedProducts}</h2>
            <ProductCardGrid products={related} market={market} />
          </Container>
        </section>
      )}
    </>
  );
}
