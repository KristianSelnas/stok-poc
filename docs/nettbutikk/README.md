# Nettbutikk – demo

Demo av en nettbutikk for STOK Emballage. Butikken fungerer som en vanlig B2B-nettbutikk og har i tillegg AI-funksjoner som hjelper kunden å finne eller beskrive riktig emballasje. Kunden har også en «Min side» med tidligere ordre, gjenkjøp og varianter av tidligere ordre.

Butikken er en egen del av nettstedet under `/no/butikk` og `/no/min-side`, med lenker fra toppmenyen og produktsidene.

**Status:** Fase A (klassisk butikk), fase B (Min side) og fase C (konfigurator) er ferdige. Fase D (AI) er neste.

## Dokumenter

| Dokument | Innhold |
|---|---|
| [01-mal-og-demomanus.md](01-mal-og-demomanus.md) | Hva demoen skal vise, demokunder og demomanus |
| [02-funksjoner.md](02-funksjoner.md) | Alle funksjonsideer, sortert og prioritert |
| [03-arkitektur.md](03-arkitektur.md) | BFF, tjenestegrensesnitt, mocker, produktdata og ruter |
| [04-ai.md](04-ai.md) | AI-funksjoner via Kantegas LLMProxy: verktøy, avgrensning og reserveplan |
| [05-faser.md](05-faser.md) | Faser, med detaljerte planer for fase A–C |

## Beslutninger

| # | Beslutning | Dato |
|---|---|---|
| N1 | Nettbutikken er en egen del av nettstedet, lenket fra toppmenyen og andre relevante steder | 23.11.2026 |
| N2 | Frontend og BFF bygges i Next.js i samme repo som nettsiden | 23.11.2026 |
| N3 | CRM, ERP og produktkatalog mockes bak tydelige grensesnitt i BFF-en, slik at de kan byttes med ekte tjenester | 23.11.2026 |
| N4 | Produktkatalogen er kilden til produktdata. Nettsidens produktsider skal på sikt hente produktene derfra, i stedet for fra Sanity | 23.11.2026 |
| N5 | Butikken finnes bare på norsk (`/no`) | 23.11.2026 |
| N6 | AI-funksjonene bruker Kantegas LLMProxy med Claude Opus 5.5 via Vertex AI (`vertex_ai/claude-opus-5-5`) | 23.11.2026 |
| N7 | Vi starter med fase A (klassisk butikk) og ser hvor langt vi kommer | 23.11.2026 |
| N8 | Demoen kjører på Vercel. Nye ordre lagres i minnet i mock-ordretjenesten, og vi godtar at de kan forsvinne hvis Vercel starter en ny instans | 24.11.2026 |
| N9 | LLMProxy brukes med Anthropic Messages API. Integrasjonen i KaVita brukes som referanse | 23.11.2026 |
| N10 | Mock-katalogen bygges fra produktene på bewifood.com, med ekte varenumre, varianter og pallestørrelser. Priser, lager og ordre lager vi selv | 23.11.2026 |
| N11 | Nettsidens produktkatalog viser alle produktene fra produktkatalogen. Redaktører velger ikke enkeltprodukter i Sanity inntil videre | 23.11.2026 |
| N12 | STOK eier rettighetene til bildene på bewifood.com, og de kan brukes i demoen | 24.11.2026 |
| N13 | Konfiguratoren tegner esken i SVG (3D-kasse og utbrettet stansemønster), uten nye pakker | 24.11.2026 |
| N14 | Pris og leveringstid i konfiguratoren regnes ut på serveren i `QuoteService.estimate`, med kundens avtalerabatt | 24.11.2026 |
| N15 | Katalogen bruker samme inndeling som filtrene på bewifood.com: produktgruppe (7, flere per produkt), type (16, én per produkt) og materiale (3), med norske navn der bewifood.com bruker engelske. Nettsiden og nettbutikken filtrerer på de samme tre | 24.11.2026 |

## Åpne spørsmål

1. ~~Hvor ligger koden til KaVita?~~ Avklart: `~/utvikling/kantega/kavita`. Kristian gjør den tilgjengelig i sandkassen før fase D.
2. Nøkkel til LLMProxy for lokal utvikling og Vercel (Kristian ordner).
