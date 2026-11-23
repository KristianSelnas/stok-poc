import { market as getMarketParam } from "next/root-params";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/lib/dictionaries";
import { defaultMarket, isMarket, marketPath } from "@/lib/markets";

export default async function NotFound() {
  const param = await getMarketParam();
  const market = isMarket(param) ? param : defaultMarket;
  const t = getDictionary(market);

  return (
    <Container className="py-24 text-center">
      <p className="font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">404</p>
      <h1 className="mt-2 text-4xl">{t.notFoundTitle}</h1>
      <p className="mx-auto mt-4 max-w-md">{t.notFoundText}</p>
      <ButtonLink href={marketPath(market)} className="mt-8">
        {t.backHome}
      </ButtonLink>
    </Container>
  );
}
