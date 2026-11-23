# SEO og tilgjengelighet

Gjort i fase 6. Resultatene er fra et lokalt produksjonsbygg 23.11.2026.

## SEO

| Hva | Hvor |
|---|---|
| `metadataBase`, standardtittel og -beskrivelse | `src/app/(site)/[market]/layout.tsx` |
| Tittel, beskrivelse, canonical, Open Graph og `hreflang` per side | `src/lib/metadata.ts` |
| `sitemap.xml` med forsider, sider, bransjer, produkter og nyheter | `src/app/sitemap.ts` |
| `robots.txt` | `src/app/robots.ts` |
| JSON-LD: `Organization` og `WebSite` på forsiden, `Product` med `BreadcrumbList`, `NewsArticle` | `src/lib/structuredData.ts` |
| Adresse og indeksering | `src/lib/site.ts` |

- **Adresse:** `NEXT_PUBLIC_SITE_URL` styrer fullstendige adresser. Uten den brukes produksjonsdomenet fra Vercel (`VERCEL_PROJECT_PRODUCTION_URL`).
- **Indeksering:** Så lenge `SITE_ALLOW_INDEXING` ikke er `true`, får alle sider `noindex, nofollow` i metatagg og i `X-Robots-Tag`-headeren. robots.txt blokkerer ikke sidene, ellers ser ikke søkemotorene `noindex`. Feltet «Skjul for søkemotorer» i Sanity virker først når indeksering er slått på. Dokumenter med feltet er alltid utelatt fra sitemap.
- **`hreflang`:** Forsidene peker alltid på hverandre. Andre sider får `hreflang` når oversettelsen er koblet i Studio med språkpluginen. Ingen dokumenter er koblet ennå. Tidligere pekte alle sider på forsidene, og det var feil.
- **Beskrivelse og delingsbilde:** Uten SEO-felt brukes ingress eller kort beskrivelse, og første bilde.

### 404-status

Sider som ikke finnes, svarer fortsatt med status 200 og `noindex` (se merknad i fase 2). Med Cache Components sendes skallet før siden vet at innholdet mangler. Ekte 404 krever at `proxy.ts` slår opp adressen i Sanity før siden rendres. Det gir et ekstra kall per besøk, eller en mellomlagret adresseliste som kan gi 404 på nypubliserte sider en kort stund. Vi lar det være i PoC-en. Søkemotorer indekserer ikke sidene, fordi de har `noindex`.

## Tilgjengelighet

Målet er WCAG 2.1 AA.

**axe** (wcag2a, wcag2aa, wcag21a, wcag21aa og best-practice) på 14 sider i mobil (390 px), nettbrett (820 px) og desktop (1440 px): 0 brudd etter rettingene under.

Rettet:

- Grønn tekst (`stok-green-dark`) er endret fra `#5E9A24` til `#4A7A1C`. Den gamle fargen ga 3,1–3,4:1 på stikktitler og etiketter, og kravet er 4,5:1. Den nye gir minst 4,7:1 mot hvit, `#F0F5FA` og `#F6F6F6`.
- Teksten i grønt CTA-banner hadde 90 % opasitet og ga 4,4:1. Opasiteten er fjernet.
- Nyhetskort er H2 når nyhetslisten ikke har overskrift. Før hoppet nyhetsoversikten fra H1 til H3.
- Mega-menyen lukkes når fokus går videre til neste menypunkt eller ut av menyen. Før ble panelet stående åpent over innholdet.
- Escape i mobilmenyen sender fokus tilbake til menyknappen. Før havnet fokus på `<body>`.

**Tastatur** (testet med Playwright): Hopp-lenken går til innholdet, alle lenker og knapper har synlig fokusring (3 px), mega-menyen og markedsvelgeren åpnes med Enter og lukkes med Escape, og produktfiltrene kan nås med Tab.

## Lighthouse

Lighthouse 12 mot lokalt produksjonsbygg. Forsiden, produktkatalogen, en produktside og en nyhetsartikkel:

| | Ytelse | Tilgjengelighet | Beste praksis | SEO |
|---|---|---|---|---|
| Desktop | 98–99 | 100 | 100 | 69 |
| Mobil | 83–86 | 100 | 100 | 69 |

- SEO trekkes bare for `noindex`. Med indeksering slått på blir det 100.
- På mobil er LCP 4,1–4,8 s med simulert treg 4G. LCP er hero-bildet, som allerede forhåndslastes. Serveren svarer på under 10 ms. Lighthouse peker også på ca. 230 KiB ubrukt JavaScript, mest Sanity Live, som lytter etter publiseringer for alle besøkende (fase 4). Vil vi forbedre mobilytelsen, kan vi laste Sanity Live bare i Draft Mode og stole på webhooken for publisert innhold.

## Responsiv test

Skjermbilder av de samme 14 sidene i mobil, nettbrett og desktop. Ingen sider gir horisontal scrolling, og menyen bytter til mobilmeny under 1024 px. Produktbildet blir stort på nettbrett, fordi det er kvadratisk i full bredde. Det kan justeres hvis STOK ønsker det.

## Slik kjører du testene på nytt

Testene kjøres mot `pnpm build && pnpm start`. Vi brukte Docker-imagene `mcr.microsoft.com/playwright/python` (axe via `axe-playwright-python`) og `mcr.microsoft.com/playwright` (Lighthouse med `--shm-size=2g`). Skriptene er ikke sjekket inn. Bruk `wait_until="load"`, fordi Sanity Live holder en tilkobling åpen, så siden aldri blir `networkidle`.
