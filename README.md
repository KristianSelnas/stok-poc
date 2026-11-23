# STOK Emballage – ny nettløsning (PoC)

Proof of concept på ny nettside for STOK Emballage i Norge og på Island, tidligere BEWI Food. Løsningen bygger på Next.js og Sanity, og bruker den grafiske profilen fra [stok.dk](https://www.stok.dk).

Planer, analyser og beslutninger ligger i [docs/](docs/README.md).

## Teknologi

- [Next.js](https://nextjs.org) 16 med App Router, Cache Components og TypeScript
- [Sanity](https://www.sanity.io) med Studio innebygd på `/studio`
- [Tailwind CSS](https://tailwindcss.com) 4 med designtokens fra STOKs profil
- pnpm som pakkehåndterer

## Kom i gang

Krav: Node.js 24 og pnpm.

```bash
pnpm install
cp .env.example .env.local   # fyll inn Sanity-verdier hvis du har dem
pnpm dev
```

Åpne <http://localhost:3000>. Du blir sendt videre til `/no`, eller til `/is` hvis nettleseren foretrekker islandsk.

### Uten Sanity

Når `NEXT_PUBLIC_SANITY_PROJECT_ID` mangler, bruker nettsiden reserveinnhold fra `src/content/fallback/`. Studio på `/studio` viser da en melding om at Sanity ikke er koblet til.

### Med Sanity

1. PoC-en bruker prosjektet `up8wp88l` og datasettet `production`. Be om tilgang på [sanity.io/manage](https://www.sanity.io/manage).
2. Legg til `http://localhost:3000` som CORS-origin med «Allow credentials».
3. Fyll inn `NEXT_PUBLIC_SANITY_PROJECT_ID` og `NEXT_PUBLIC_SANITY_DATASET` i `.env.local`.
4. Start `pnpm dev` og åpne <http://localhost:3000/studio>.

Endringer fra Studio vises på en deployet side via webhook (se [docs/10-webhook.md](docs/10-webhook.md)). Lokalt starter du `pnpm dev` på nytt for å hente ferskt innhold.

## Kommandoer

| Kommando            | Hva den gjør                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `pnpm dev`          | Utviklingsserver                                                    |
| `pnpm build`        | Produksjonsbygg                                                     |
| `pnpm start`        | Kjører produksjonsbygget                                            |
| `pnpm lint`         | ESLint                                                              |
| `pnpm typecheck`    | Genererer rutetyper og kjører TypeScript                            |
| `pnpm format`       | Formaterer koden med Prettier                                       |
| `pnpm typegen`      | Genererer typer fra Sanity-skjema og GROQ                           |
| `pnpm seed`         | Legger reserveinnholdet (fase 2) inn i Sanity                       |
| `pnpm seed:content` | Legger innholdet for fase 3 inn i Sanity (`--dry-run`, `--replace`) |

## Struktur

```
src/
├── app/
│   ├── (site)/[market]/     Nettsiden. [market] er «no» eller «is»
│   └── (studio)/studio/     Sanity Studio
├── components/
│   ├── layout/              Header, mega-meny, bunntekst, markedsvelger
│   ├── modules/             Én komponent per sidemodul (hero, kortrutenett …)
│   └── ui/                  Knapper, bilder, lenker og layoutkomponenter
├── content/fallback/        Reserveinnhold når Sanity ikke er koblet til
├── lib/                     Markeder, UI-tekster, datahenting
├── proxy.ts                 Sender besøkende til riktig marked
└── sanity/
    ├── schemaTypes/         Dokumenttyper, moduler og objekter
    ├── structure.ts         Venstremenyen i Studio
    ├── queries.ts           GROQ-spørringer
    ├── sanity.types.ts      Generert av TypeGen (ikke rediger)
    └── types.ts             Typer avledet fra de genererte
```

## Markeder

Hvert marked har sitt eget prefiks i URL-en (`/no`, `/is`) og sine egne dokumenter i Sanity. Forside, innstillinger og navigasjon er singletons med faste ID-er per språk, for eksempel `frontPage-nb` og `navigation-is`. Sider (`page`) oversettes med `@sanity/document-internationalization`, og har feltet `language`.

## Moduler

Forsiden og sidene bygges av moduler: hero, rik tekst, tekst med bilde, kortrutenett, fordelsliste og CTA-banner. Skjemaene ligger i `src/sanity/schemaTypes/modules.ts`, komponentene i `src/components/modules/`.

Etter endringer i skjema eller GROQ-spørringer kjører du `pnpm typegen`.
