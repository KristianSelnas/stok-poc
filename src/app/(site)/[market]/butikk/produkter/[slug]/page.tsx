import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductImageBox } from "@/components/shop/ProductImageBox";
import { VariantPurchase } from "@/components/shop/VariantPurchase";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getRoutes } from "@/lib/content";
import { documentHref } from "@/lib/links";
import { marketPath } from "@/lib/markets";
import { t } from "@/shop/dictionary";
import type { Product } from "@/shop/domain";
import { shop } from "@/shop/index";
import { catalogPath, productPath, SHOP_MARKET, shopPath } from "@/shop/paths";
import { getShopProduct, getShopTaxonomy, listShopProducts } from "@/shop/queries";
import { getSession } from "@/shop/session";

export async function generateStaticParams({ params }: { params: { market: string } }) {
  const slugs = (await listShopProducts()).map((p) => ({ slug: p.slug }));
  // Butikken finnes bare i /no. Cache Components krever minst én verdi, så
  // andre markeder får én adresse, som layouten svarer med 404 på.
  return params.market === SHOP_MARKET ? slugs : slugs.slice(0, 1);
}

export async function generateMetadata({
  params,
}: PageProps<"/[market]/butikk/produkter/[slug]">): Promise<Metadata> {
  const product = await getShopProduct((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
    alternates: { canonical: productPath(product.slug) },
  };
}

async function Purchase({ product }: { product: Product }) {
  const session = await getSession();
  const skus = product.variants.map((v) => v.sku);
  const [prices, inventory] = await Promise.all([
    shop().pricing.getPrices(skus, session?.customer.id),
    shop().inventory.getInventory(skus),
  ]);
  const path = productPath(product.slug);
  return (
    <VariantPurchase
      variants={product.variants.map(({ sku, name, salesMode, unitsPerBundle, unitsPerPallet }) => ({
        sku,
        name,
        salesMode,
        unitsPerBundle,
        unitsPerPallet,
      }))}
      prices={prices}
      inventory={inventory}
      loggedIn={!!session}
      loginHref={`${shopPath("/logg-inn")}?neste=${encodeURIComponent(path)}`}
      cartHref={shopPath("/handlekurv")}
      quoteHref={marketPath(SHOP_MARKET, "/kontakt")}
    />
  );
}

function PurchaseSkeleton() {
  return (
    <div aria-busy="true" className="h-96 animate-pulse rounded-3xl bg-white motion-reduce:animate-none" />
  );
}

/** Lenke til produktsiden på nettsiden, når produktet finnes der. */
async function websiteHref(slug: string): Promise<string | undefined> {
  const routes = await getRoutes(SHOP_MARKET);
  return routes.some((r) => r._type === "product" && r.slug === slug)
    ? documentHref("product", slug, SHOP_MARKET)
    : undefined;
}

export default async function ShopProductPage({ params }: PageProps<"/[market]/butikk/produkter/[slug]">) {
  const { slug } = await params;
  const product = await getShopProduct(slug);
  if (!product) notFound();
  const [{ groups }, siteHref] = await Promise.all([getShopTaxonomy(), websiteHref(slug)]);
  const group = groups.find((g) => g.slug === product.group);
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
                <Link href={shopPath()} className="text-stok-blue hover:underline">
                  {t.shopHome}
                </Link>
              </li>
              {group && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={catalogPath({ gruppe: group.slug })}
                      className="text-stok-blue hover:underline"
                    >
                      {group.title}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <ProductImageBox
                image={mainImage ?? null}
                preload
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-square rounded-[2rem] bg-white"
              />
              {moreImages.length > 0 && (
                <ul className="mt-4 grid grid-cols-4 gap-3">
                  {moreImages.slice(0, 4).map((image) => (
                    <li key={image.url}>
                      <ProductImageBox
                        image={image}
                        sizes="120px"
                        className="aspect-square rounded-2xl bg-white"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              {group && (
                <p className="mb-2 font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
                  {group.title}
                </p>
              )}
              <h1 className="text-4xl md:text-5xl">{product.name}</h1>
              {product.shortDescription && <p className="mt-4 text-xl">{product.shortDescription}</p>}
              <div className="mt-8">
                <Suspense fallback={<PurchaseSkeleton />}>
                  <Purchase product={product} />
                </Suspense>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          <div className="max-w-3xl space-y-4 text-lg">
            <h2 className="text-3xl">{t.details}</h2>
            {product.description.map((block, i) =>
              block.type === "h" ? (
                <h3 key={i} className="pt-2 text-2xl">
                  {block.text}
                </h3>
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
            <div className="flex flex-wrap gap-4 pt-4">
              {siteHref && (
                <Link href={siteHref} className={buttonClasses("outline")}>
                  {t.onWebsite}
                </Link>
              )}
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

      {attributeLabels.length > 0 && (
        <section className="bg-stok-light py-14 md:py-20">
          <Container>
            <h2 className="mb-6 text-3xl">{t.variantTable}</h2>
            <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stok-blue/10">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="bg-stok-blue text-white">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      {t.sku}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t.product}
                    </th>
                    {attributeLabels.map(([key, label]) => (
                      <th key={key} scope="col" className="px-4 py-3">
                        {label}
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-3">
                      {t.status}
                    </th>
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
                      <td className="px-4 py-3 whitespace-nowrap">{t.salesMode[v.salesMode]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {product.note && <p className="mt-4">{product.note}</p>}
            <p className="mt-4 text-sm">{t.sourceNote(product.source.name)}</p>
          </Container>
        </section>
      )}
    </>
  );
}
