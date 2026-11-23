import Link from "next/link";

import { formatDate } from "@/lib/format";
import { documentHref } from "@/lib/links";
import type { MarketId } from "@/lib/markets";
import type { NewsCard as NewsCardData } from "@/sanity/types";

import { ContentImage } from "./ContentImage";

type HeadingLevel = "h2" | "h3";

/**
 * Nyhetskort med bilde, dato, kategori, tittel og ingress. Hele kortet er klikkbart.
 * Tittelen er H3 under en seksjonsoverskrift, og H2 når listen ikke har overskrift.
 */
export function NewsCard({
  article,
  market,
  headingLevel: Heading = "h3",
}: {
  article: NewsCardData;
  market: MarketId;
  headingLevel?: HeadingLevel;
}) {
  const href = documentHref("newsArticle", article.slug, market);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-stok-blue/10 transition-shadow hover:shadow-lg">
      <div className="relative aspect-[3/2] overflow-hidden bg-stok-light">
        <ContentImage
          image={article.image}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase">
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, market)}</time>
          )}
          {article.category && <span> · {article.category}</span>}
        </p>
        <Heading className="mt-2 text-xl">
          {href ? (
            <Link href={href} className="after:absolute after:inset-0">
              {article.title}
            </Link>
          ) : (
            article.title
          )}
        </Heading>
        {article.excerpt && <p className="mt-2 line-clamp-3">{article.excerpt}</p>}
      </div>
    </article>
  );
}

export function NewsCardGrid({
  articles,
  market,
  headingLevel,
}: {
  articles: NewsCardData[];
  market: MarketId;
  headingLevel?: HeadingLevel;
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <li key={article._id}>
          <NewsCard article={article} market={market} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
