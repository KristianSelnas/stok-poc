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

Sanity-prosjektet er ikke opprettet ennå. Når `NEXT_PUBLIC_SANITY_PROJECT_ID` mangler, bruker nettsiden reserveinnhold fra `src/content/fallback.ts`. Studio på `/studio` viser da en melding om at Sanity ikke er koblet til.

### Med Sanity

1. Opprett prosjektet på [sanity.io/manage](https://www.sanity.io/manage), med datasettene `development` og `production`.
2. Legg til `http://localhost:3000` som CORS-origin med «Allow credentials».
3. Fyll inn `NEXT_PUBLIC_SANITY_PROJECT_ID` og `NEXT_PUBLIC_SANITY_DATASET` i `.env.local`.
4. Start `pnpm dev` og åpne <http://localhost:3000/studio>.

## Kommandoer

| Kommando         | Hva den gjør                             |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Utviklingsserver                         |
| `pnpm build`     | Produksjonsbygg                          |
| `pnpm start`     | Kjører produksjonsbygget                 |
| `pnpm lint`      | ESLint                                   |
| `pnpm typecheck` | Genererer rutetyper og kjører TypeScript |
| `pnpm format`    | Formaterer koden med Prettier            |

## Struktur

```
src/
├── app/
│   ├── (site)/[market]/     Nettsiden. [market] er «no» eller «is»
│   └── (studio)/studio/     Sanity Studio
├── components/
│   ├── layout/              Header, mega-meny, bunntekst, markedsvelger
│   └── ui/                  Knapper og layoutkomponenter
├── content/fallback.ts      Reserveinnhold når Sanity ikke er koblet til
├── lib/                     Markeder, UI-tekster, datahenting
├── proxy.ts                 Sender besøkende til riktig marked
└── sanity/
    ├── schemaTypes/         Dokumenttyper og objekter
    ├── structure.ts         Venstremenyen i Studio
    └── queries.ts           GROQ-spørringer
```

## Markeder

Hvert marked har sitt eget prefiks i URL-en (`/no`, `/is`) og sine egne dokumenter i Sanity. Innstillinger og navigasjon er singletons med faste ID-er per språk, for eksempel `siteSettings-nb` og `navigation-is`.
