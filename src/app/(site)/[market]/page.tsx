import { notFound } from "next/navigation";
import { market as getMarketParam } from "next/root-params";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { isMarket, marketPath } from "@/lib/markets";

/**
 * Midlertidig forside for fase 1. Viser profilen (farger, fonter, knapper).
 * Erstattes av en forside bygget fra moduler i Sanity i fase 2.
 */
const copy = {
  no: {
    eyebrow: "Emballasje og rådgivning",
    title: "Vi skaper verdi gjennom emballasjeløsninger",
    lead: "STOK Emballage hjelper norske virksomheter med riktig emballasje, sikker levering og mindre svinn. BEWI Food er nå en del av STOK.",
    primary: { label: "Se våre løsninger", path: "/losninger" },
    secondary: { label: "Kontakt oss", path: "/kontakt" },
    benefits: [
      { title: "Rådgivning", text: "Vi finner emballasjen som passer produktet og prosessen din." },
      { title: "Optimal drift", text: "Riktig emballasje gir færre stopp og mer effektiv pakking." },
      { title: "Lagerstyring", text: "Vi holder lager for deg, så du får varene når du trenger dem." },
      { title: "Sikkerhet og service", text: "Fast kontaktperson og leveranser du kan stole på." },
    ],
  },
  is: {
    eyebrow: "Umbúðir og ráðgjöf",
    title: "Við sköpum verðmæti með umbúðalausnum",
    lead: "STOK Emballage aðstoðar fyrirtæki við að velja réttar umbúðir, tryggja örugga afhendingu og draga úr sóun.",
    primary: { label: "Skoða lausnir", path: "/lausnir" },
    secondary: { label: "Hafðu samband", path: "/hafa-samband" },
    benefits: [
      { title: "Ráðgjöf", text: "Við finnum umbúðir sem henta vörunni og ferlinu þínu." },
      { title: "Hagkvæmur rekstur", text: "Réttar umbúðir þýða færri stopp og skilvirkari pökkun." },
      { title: "Birgðastýring", text: "Við geymum birgðir fyrir þig svo þú fáir vörurnar þegar þú þarft." },
      { title: "Öryggi og þjónusta", text: "Fastur tengiliður og áreiðanlegar afhendingar." },
    ],
  },
};

export default async function FrontPage() {
  const market = await getMarketParam();
  if (!isMarket(market)) notFound();
  const c = copy[market];

  return (
    <>
      <section className="relative overflow-hidden bg-stok-light">
        <Container className="grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <p className="mb-4 font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
              {c.eyebrow}
            </p>
            <h1 className="text-4xl leading-tight md:text-5xl lg:text-6xl">{c.title}</h1>
            <p className="mt-6 max-w-xl text-lg md:text-xl">{c.lead}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href={marketPath(market, c.primary.path)}>{c.primary.label}</ButtonLink>
              <ButtonLink href={marketPath(market, c.secondary.path)} variant="outline">
                {c.secondary.label}
              </ButtonLink>
            </div>
          </div>
          <div aria-hidden="true" className="relative hidden aspect-square lg:block">
            <div className="absolute inset-8 rounded-l-full bg-stok-blue" />
            <div className="absolute right-0 bottom-0 h-1/2 w-1/2 rounded-tl-full bg-stok-green" />
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 md:py-20">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {c.benefits.map((benefit) => (
              <li key={benefit.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stok-green/20 text-stok-green-dark"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="m4 10.5 4 4 8-9" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-xl">{benefit.title}</h2>
                  <p className="mt-1">{benefit.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
