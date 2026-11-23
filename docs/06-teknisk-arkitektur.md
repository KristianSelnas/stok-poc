# Teknisk arkitektur

## Oversikt

```
┌─────────────────────────┐        GROQ / CDN       ┌──────────────────┐
│ Next.js (App Router)    │ ◄────────────────────── │ Sanity Content   │
│  - Nettsiden            │                         │ Lake (dataset)   │
│  - Sanity Studio /studio│ ──── skriver innhold ─► │                  │
└───────────┬─────────────┘                         └────────┬─────────┘
            │                                                │
            │ ◄──────── webhook / Live Content API ──────────┘
            ▼
      Vercel (hosting)
```

## Valg

| Område | Valg | Begrunnelse |
|---|---|---|
| Rammeverk | Next.js, siste stabile versjon, App Router, TypeScript | Krav fra oppdraget. Server Components gir lite JavaScript til klienten |
| Innhold | Sanity, siste stabile Studio | Krav fra oppdraget |
| Studio | Innebygd i Next-appen på `/studio` | Ett repo og én deploy. Enkelt for en PoC |
| Datahenting | `next-sanity` med GROQ og `defineLive` | Offisiell integrasjon med caching og live-oppdatering |
| Typer | Sanity TypeGen | Typesikre GROQ-spørringer |
| Forhåndsvisning | Draft Mode og Presentation-verktøyet (Visual Editing) | Redaktøren klikker i forhåndsvisningen og redigerer feltet direkte |
| Styling | Tailwind CSS med designtokens fra profilen | Rask utvikling og konsekvent bruk av profilen |
| Bilder | Sanity image pipeline med `next/image`, hotspot og crop | Riktig størrelse og format automatisk |
| Fonter | `next/font/google` (Nunito, Poppins) | Lastes fra eget domene |
| Skjema | Server Action som sender e-post (f.eks. Resend) eller lagrer i Sanity | Enkel løsning uten egen backend |
| Hosting | Vercel | Naturlig for Next.js, forhåndsvisnings-URL per gren |
| Kode | Privat repo på Kantegas GitHub | Beslutning B12 |
| Kodekvalitet | ESLint, Prettier, TypeScript strict | Standard oppsett |
| Pakkehåndtering | pnpm | Raskt og vanlig |
| Markeder og språk | Markedsprefiks i URL (`/no`, `/is`) med Next.js-middleware. Ett Sanity-dataset med språkfelt per dokument | Én kodebase og én Studio for begge markedene |
| Produktfiltre | Filtrering i GROQ på serveren, styrt av URL-parametere | Delbare URL-er og lite JavaScript i nettleseren |

## Mappestruktur (forslag)

```
stok-poc/
├── docs/                    Planer og beslutninger
├── src/
│   ├── app/
│   │   ├── [market]/        Nettsiden per marked (no, is)
│   │   │   ├── page.tsx     Forside
│   │   │   ├── [...slug]/   Generiske sider
│   │   │   ├── bransjer/[slug]/
│   │   │   ├── produkter/   Katalog, gruppe og produkt
│   │   │   └── nyheter/
│   │   ├── studio/[[...tool]]/  Sanity Studio
│   │   └── api/draft-mode/  Aktivering av forhåndsvisning
│   ├── components/
│   │   ├── modules/         Én komponent per sidemodul
│   │   └── ui/              Knapper, kort, layout
│   └── sanity/
│       ├── schemaTypes/     Dokumenttyper og moduler
│       ├── lib/             Klient, live, bilde-URL
│       └── queries.ts       GROQ-spørringer
├── sanity.config.ts
└── sanity.cli.ts
```

## Rendering og caching

- Sidene genereres statisk og oppdateres når innhold endres (Live Content API eller tag-basert revalidering via webhook).
- `generateStaticParams` lager alle kjente sider ved bygg.
- `generateMetadata` henter SEO-felter fra Sanity.

## Miljøer

| Miljø | Sanity-dataset | URL |
|---|---|---|
| Lokal | `development` | localhost:3000 |
| Forhåndsvisning | `development` | Vercel preview per gren |
| PoC-demo | `production` | Vercel-domene, f.eks. stok-poc.vercel.app |

## Hemmeligheter

Sanity-token og eventuelle e-postnøkler ligger i `.env.local` lokalt og i Vercel-miljøvariabler. De sjekkes aldri inn.

## Tilgjengelighet og SEO

- Mål om WCAG 2.1 AA (lovkrav i Norge for nettsteder)
- Semantisk HTML, synlig fokus, tastaturnavigasjon i mega-menyen
- `sitemap.xml`, `robots.txt`, Open Graph-bilder og JSON-LD for organisasjon, produkter og artikler
- `hreflang` mellom norsk og islandsk versjon av samme side
- `noindex` på PoC-domenet så den ikke konkurrerer med eksisterende sider
