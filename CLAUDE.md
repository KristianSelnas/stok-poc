@AGENTS.md

# STOK Emballage PoC

Next.js 16 (App Router, Cache Components) + Sanity (Studio på `/studio`) + Tailwind 4. pnpm, Node 24.
Oppsett, kommandoer og mappestruktur står i `README.md`. Planer og beslutninger ligger i `docs/`.

## Konvensjoner

- Kode, kommentarer, dokumentasjon og commit-meldinger skrives på norsk (bokmål).
- To markeder: `/no` (språk `nb`) og `/is` (språk `is`), definert i `src/lib/markets.ts`. Alt innhold og alle lenker er markedsavhengige; bruk `marketPath()`.
- Faste UI-tekster ligger i `src/lib/dictionaries.ts`, ikke hardkodet i komponenter. Legg inn både `no` og `is`.
- Datahenting går via `src/lib/content.ts` (`use cache` + `cacheTag`). Nye spørringer i `src/sanity/queries.ts`.
- Ny sidemodul: skjema i `src/sanity/schemaTypes/modules.ts`, komponent i `src/components/modules/`, registrer i `Modules.tsx`.
- Etter endring i skjema eller GROQ: kjør `pnpm typegen`. Ikke rediger `sanity.types.ts` eller `schema.json` for hånd.
- Prettier med `printWidth: 110` og Tailwind-plugin.

## Før du er ferdig

`pnpm typecheck`, `pnpm lint` og `pnpm format:check` skal gå uten feil.
