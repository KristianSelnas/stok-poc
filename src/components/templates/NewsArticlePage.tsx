import Link from "next/link";

import { getDictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/format";
import { marketPath, type MarketId } from "@/lib/markets";
import { routePrefixes } from "@/lib/routes";
import type { NewsArticle } from "@/sanity/types";

import { PortableText } from "../PortableText";
import { Container } from "../ui/Container";
import { ContentImage } from "../ui/ContentImage";
import { NewsCardGrid } from "../ui/NewsCard";

/** Nyhetsartikkel med dato, kategori, bilde og brødtekst, og tre andre nyheter under. */
export function NewsArticlePage({ article, market }: { article: NewsArticle; market: MarketId }) {
  const t = getDictionary(market);
  const newsHref = marketPath(market, `/${routePrefixes.newsArticle[market]}`);
  const more = (article.moreNews ?? []).filter(Boolean);

  return (
    <>
      <article>
        <header className="bg-stok-light">
          <Container className="py-12 md:py-16">
            <div className="mx-auto max-w-4xl">
              <nav aria-label={t.breadcrumbs} className="mb-6 font-meta text-sm">
                <Link href={newsHref} className="text-stok-blue hover:underline">
                  ← {t.news}
                </Link>
              </nav>
              <p className="font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
                {article.publishedAt && (
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, market)}</time>
                )}
                {article.category && <span> · {article.category}</span>}
              </p>
              <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{article.title}</h1>
              {article.excerpt && <p className="mt-6 text-xl text-stok-blue">{article.excerpt}</p>}
            </div>
          </Container>
        </header>

        {article.image?.url && (
          <Container>
            <div className="relative mx-auto mt-8 aspect-[16/9] max-w-5xl overflow-hidden rounded-[2rem]">
              <ContentImage
                image={article.image}
                fill
                preload
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        )}

        <Container className="py-12 md:py-16">
          <PortableText value={article.body} market={market} className="mx-auto max-w-3xl text-lg" />
        </Container>
      </article>

      {more.length > 0 && (
        <section className="bg-stok-light py-14 md:py-20">
          <Container>
            <h2 className="mb-10 text-3xl">{t.moreNews}</h2>
            <NewsCardGrid articles={more} market={market} />
          </Container>
        </section>
      )}
    </>
  );
}
