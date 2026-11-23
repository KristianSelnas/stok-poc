# Utviklingsplan

Planen er delt i faser. Hver fase avsluttes med noe som kan vises. Estimatene forutsetter én utvikler og må justeres når omfanget er avklart.

## Fase 0: Avklaring (pågår)

- Avklare omfang, innhold og tilganger (se [09-beslutninger-og-sporsmal.md](09-beslutninger-og-sporsmal.md))
- Opprette Sanity-prosjekt, privat GitHub-repo hos Kantega og Vercel-prosjekt
- **Leveranse:** Godkjent plan

## Fase 1: Fundament (ca. 1–2 dager) – utviklet, ikke deployet

- [x] Sette opp Next.js med TypeScript, Tailwind, ESLint og Prettier
- [x] Legge inn designtokens, fonter og logo
- [x] Bygge grunnlayout: header med mega-meny, bunntekst, mobilmeny
- [x] Sette opp Sanity Studio på `/studio` med `siteSettings` og `navigation`
- [x] Sette opp markedsruting (`/no`, `/is`), språkfelt i Sanity og markedsvelger
- [ ] Deploye til Vercel (venter på Sanity-prosjekt, GitHub-repo og Vercel-prosjekt hos Kantega)
- **Leveranse:** Side med STOK-profil, meny og bunntekst styrt fra Sanity

**Merknader fra fase 1:**

- Nettsiden bruker reserveinnhold (`src/content/fallback.ts`) til Sanity-prosjektet er opprettet.
- Lenker i menyen er stier i fase 1. Interne referanser til dokumenter kommer i fase 2.
- 404-sider får riktig statuskode og `noindex`, men rendres i nettleseren på grunn av Cache Components. Vurderes på nytt når catch-all-ruten henter sider fra Sanity i fase 2.
- Islandske UI-tekster og menypunkter må kvalitetssikres.

## Fase 2: Sidebygger og moduler (ca. 3–4 dager)

- Lage dokumenttypen `page` og felles objekttyper (`link`, `seo`, `imageWithAlt`)
- Bygge modulene `hero`, `richText`, `textWithImage`, `cardGrid`, `featureList`, `ctaBanner`
- Sette opp TypeGen og GROQ-spørringer
- Lage forsiden
- **Leveranse:** Forside bygget fra moduler i Sanity

## Fase 3: Innholdstyper og produktkatalog (ca. 4–5 dager)

- `industry` og `service` med egne ruter
- Produktkatalog: `product`, `productGroup`, `material`, oversikt med filtre og produktside
- Automatiske relasjoner (bransjefliser, relaterte produkter)
- `person` og `department` med kontaktside
- `newsArticle` med oversikt og artikkelside
- `testimonial`, `location`, `certificate` og tilhørende moduler
- **Leveranse:** Alle sidetyper i PoC-en fungerer

## Fase 4: Redaktøropplevelse (ca. 2 dager)

- Draft Mode og Presentation-verktøyet
- Strukturert Studio-meny og forhåndsvisning av moduler
- Validering og hjelpetekster
- Live-oppdatering eller webhook-revalidering
- **Leveranse:** Redaktøren kan lage og forhåndsvise sider på egen hånd

## Fase 5: Innhold (ca. 2 dager, parallelt med fase 3–4)

- Hente norsk innhold fra bewifood.com: bransjetekster, et utvalg produkter, kontaktpersoner og juridiske sider
- Skrive forsidetekster og verdiløfte i STOK-stil, med stok.dk som mal for tone
- Lage et importskript for produkter, så vi slipper manuell registrering
- Lage islandsk versjon av forside, kontaktside og et utvalg sider
- Laste opp bilder
- **Leveranse:** Siden oppleves som en ekte nettside

## Fase 6: Kvalitet og demo (ca. 1–2 dager)

- Kontaktskjema
- SEO: metadata, sitemap, robots, JSON-LD, `noindex` på demo
- Tilgjengelighetssjekk (axe, tastatur, kontrast) og Lighthouse
- Responsiv test på mobil, nettbrett og desktop
- Kort brukerveiledning for redaktører
- **Leveranse:** Demo for STOK

## Samlet estimat

Rundt 17–20 utviklerdager, avhengig av omfang og hvor mye innhold vi må produsere selv.

## Risiko

| Risiko | Tiltak |
|---|---|
| Innhold på bewifood.com er delvis engelsk eller utdatert | Skrive om til norsk og merke tekster som må kvalitetssikres av STOK |
| Uklar merkevare og domene (STOK, STOK Emballage, BEWI Food-overgang) | Avklare tidlig, før forside og logo |
| Produktdata ligger i et annet system | Avklare kilde. I PoC-en importerer vi et utvalg fra bewifood.com |
| Grønn knappefarge har for lav kontrast | Foreslå tilpasning i fase 1 og få den godkjent |
| Rettigheter til bilder fra stok.dk og bewifood.com | Få skriftlig tillatelse eller bruke lisensfrie bilder |
