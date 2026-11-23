# Utviklingsplan

Planen er delt i faser. Hver fase avsluttes med noe som kan vises. Estimatene forutsetter én utvikler og må justeres når omfanget er avklart.

## Fase 0: Avklaring – ferdig

- Avklare omfang, innhold og tilganger (se [09-beslutninger-og-sporsmal.md](09-beslutninger-og-sporsmal.md))
- Opprette Sanity-prosjekt, privat GitHub-repo hos Kantega og Vercel-prosjekt
- **Leveranse:** Godkjent plan

## Fase 1: Fundament (ca. 1–2 dager) – ferdig

- [x] Sette opp Next.js med TypeScript, Tailwind, ESLint og Prettier
- [x] Legge inn designtokens, fonter og logo
- [x] Bygge grunnlayout: header med mega-meny, bunntekst, mobilmeny
- [x] Sette opp Sanity Studio på `/studio` med `siteSettings` og `navigation`
- [x] Sette opp markedsruting (`/no`, `/is`), språkfelt i Sanity og markedsvelger
- [x] Deploye til Vercel: https://stok-poc.vercel.app/no
- **Leveranse:** Side med STOK-profil, meny og bunntekst styrt fra Sanity

**Merknader fra fase 1:**

- Lenker i menyen er stier i fase 1. Interne referanser til dokumenter kommer i fase 2.
- Islandske UI-tekster og menypunkter må kvalitetssikres.
- Vercel-prosjektet bruker de samme fire miljøvariablene som `.env.local` (se `.env.example`). Vi bruker ikke Sanity-integrasjonen i Vercel.
- Studioet på https://stok-poc.vercel.app/studio er registrert i Sanity-prosjektet. Bare medlemmer av prosjektet `up8wp88l` får tilgang, og medlemmer styres under Members i sanity.io/manage.
- Webhooken i Sanity må peke på `https://stok-poc.vercel.app/api/revalidate`. Det er ikke testet ennå at publisering tømmer cachen i produksjon.

## Fase 2: Sidebygger og moduler (ca. 3–4 dager) – utviklet

- [x] Lage dokumenttypen `page` og felles objekttyper (`link`, `linkAnnotation`, `seo`, `imageWithAlt`, `blockContent`)
- [x] Bygge modulene `hero`, `richText`, `textWithImage`, `cardGrid`, `featureList`, `ctaBanner`
- [x] Sette opp TypeGen og GROQ-spørringer
- [x] Lage forsiden (`frontPage`, én per marked)
- [x] Språkplugin for `page`, og Studio-meny med Forside, Sider, Navigasjon og Innstillinger per marked
- **Leveranse:** Forside og generelle sider bygget fra moduler i Sanity

**Merknader fra fase 2:**

- Startinnholdet i `scripts/content/base.ts` dekker forside, Løsninger, Om oss, Bærekraft og Åpenhetsloven på norsk, og forside og Um okkur på islandsk. Det er typet mot TypeGen-typene, så det følger skjemaet.
- Bildene i `public/images/innhold/` er hentet fra bewifood.com (beslutning B7).
- Sider som ikke finnes, viser 404-siden med `noindex`, men statuskoden er 200. Med Cache Components sendes det statiske skallet før siden vet at innholdet mangler. Next anbefaler å sjekke adressen i `proxy.ts` hvis vi trenger ekte 404-status. Vurderes i fase 6.
- Menylenker til bransjer, produkter, nyheter og kontakt er stier og gir 404 til fase 3.
- Sanity-prosjektet `up8wp88l` er koblet til. Startinnholdet er importert med `pnpm seed` (`scripts/seed-sanity.ts`), og siden henter innhold og bilder fra Sanity. Nettsiden har ikke lenger noe reserveinnhold, så den krever Sanity.
- Sanity-kall bruker `cache: "no-store"`, så bare `use cache` styrer cachingen. Uten det la Next svarene i fetch-cachen i 15 minutter, også på tvers av bygg.
- Webhook-revalidering er satt opp tidlig (`/api/revalidate`, se [10-webhook.md](10-webhook.md)). Innhold caches i én time og tømmes når noe publiseres.

## Fase 3: Innholdstyper og produktkatalog (ca. 4–5 dager) – utviklet, venter på import

- [x] `industry` med egen rute (`/no/bransjer/<slug>`, `/is/atvinnugreinar/<slug>`). Tjenester lages som vanlige sider
- [x] Produktkatalog: `product`, `productGroup`, `material`, oversikt med filtre og produktside
- [x] Automatiske relasjoner: produkter på bransjesider, andre produkter i samme gruppe på produktsider
- [x] `person`, `department` og `location` med kontaktside
- [x] `newsArticle` og `newsCategory` med oversikt og artikkelside
- [x] `testimonial` og `certificate` med modulene Kundesitater og Logorad (uten innhold ennå)
- [x] Importskript for innholdet (`pnpm seed:content`)
- **Leveranse:** Alle sidetyper i PoC-en fungerer

**Merknader fra fase 3:**

- Alle undersider går gjennom én catch-all-rute, og `src/lib/routes.ts` bestemmer dokumenttype ut fra adressen.
- Adressen leses inne i en Suspense-grense, slik Next anbefaler for raske navigasjoner. Ved navigasjon vises en plassholder (`PageSkeleton`) til innholdet er klart. Sidene er fortsatt forhåndsrendret: innholdet ligger i samme HTML-svar som plassholderen og byttes inn med en gang.
- Innholdet ligger i `scripts/content/`: produkter og kontakter som JSON generert fra bewifood.com, bransjer og sider som TypeScript.
- 18 norske produkter i 12 grupper og 6 islandske produkter. Relaterte produkter mangler på bewifood.com, så produktsiden viser andre produkter i samme gruppe.
- Kontaktpersoner er hentet fra bewifood.com (13 norske, 19 islandske), uten bilder. Kortene viser initialer.
- Bransjen «Landbruk og industri» finnes ikke på bewifood.com. Teksten er skrevet for PoC-en.
- bewifood.com har bare to aktuelle nyheter. To nyheter fra stok.dk er oversatt til norsk.
- Kundesitater og sertifikater har ingen innhold ennå. Sitatene på stok.dk er fra danske kunder.

## Fase 4: Redaktøropplevelse (ca. 2 dager) – påbegynt

- [x] Draft Mode og Presentation-verktøyet (se [11-forhandsvisning.md](11-forhandsvisning.md))
- [x] Live-oppdatering med Sanity Live, både i Presentation-verktøyet og for publisert innhold
- [x] Strukturert Studio-meny (gjort i fase 1–3)
- [ ] Forhåndsvisningsbilder for moduler i «Legg til modul»
- [ ] Gå gjennom validering og hjelpetekster
- [x] Webhook-revalidering (gjort i fase 2)
- **Leveranse:** Redaktøren kan lage og forhåndsvise sider på egen hånd

## Fase 5: Innhold (ca. 2 dager, parallelt med fase 3–4)

- Hente norsk innhold fra bewifood.com: bransjetekster, et utvalg produkter, kontaktpersoner og juridiske sider
- Skrive forsidetekster og verdiløfte i STOK-stil, med stok.dk som mal for tone
- Lage et importskript for produkter, så vi slipper manuell registrering
- Lage islandsk versjon av forside, kontaktside og et utvalg sider
- Laste opp bilder
- **Leveranse:** Siden oppleves som en ekte nettside

## Fase 6: Kvalitet og demo (ca. 1–2 dager) – påbegynt

- [ ] ~~Kontaktskjema~~ (trengs ikke i demoen)
- [x] SEO: metadata, sitemap, robots, JSON-LD, `noindex` på demo
- [x] Tilgjengelighetssjekk (axe, tastatur, kontrast) og Lighthouse
- [x] Responsiv test på mobil, nettbrett og desktop
- [ ] Kort brukerveiledning for redaktører
- **Leveranse:** Demo for STOK

**Merknader fra fase 6:**

- Resultater og rettinger står i [12-seo-og-tilgjengelighet.md](12-seo-og-tilgjengelighet.md).
- Grønn tekstfarge er gjort mørkere (`#4A7A1C`) for å nå kontrastkravet. Det bør godkjennes sammen med B13.
- Ekte 404-status er vurdert og utsatt (se 12-seo-og-tilgjengelighet.md).
- Vercel trenger ingen nye miljøvariabler nå. `NEXT_PUBLIC_SITE_URL` settes når PoC-en får eget domene, og `SITE_ALLOW_INDEXING=true` ved lansering.

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
