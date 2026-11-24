# Arkitektur

## Oversikt

```
Nettleser
   │
   ▼
Next.js (samme app som nettsiden)
   ├── /no/butikk, /no/min-side      Sider (serverkomponenter) og server actions
   ├── /api/butikk/...               Route handlers der klienten trenger et API
   │
   ▼
BFF: src/shop/
   ├── services/                     Grensesnitt (kontrakter) per bakenforliggende system
   ├── mock/                         Mock-implementasjoner med JSON-data
   ├── adapters/                     Ekte implementasjoner (senere)
   └── index.ts                      Velger implementasjon ut fra miljøvariabel
   │
   ▼
Produktkatalog (PIM) · ERP · CRM · LLMProxy
```

Sidene og server actions kaller aldri mockene direkte. De henter tjenestene fra `src/shop/index.ts`, som gir enten mocken eller en ekte adapter. Når STOK kobler på et ekte system, skriver vi en ny adapter som oppfyller samme grensesnitt. Frontend endres ikke.

## Tjenester

| Tjeneste | System senere | Ansvar |
|---|---|---|
| `CatalogService` | Produktkatalog (PIM) | Produkter, varianter, produktgrupper, materialer, bilder, egenskaper |
| `InventoryService` | ERP | Lagerstatus og leveringstid per variant |
| `PricingService` | ERP | Listepris, avtalepris per kunde og mengderabatt |
| `CustomerService` | CRM | Firma, brukere, leveringsadresser og prisavtale |
| `OrderService` | ERP | Ordre, ordrelinjer, status og fakturaer |
| `QuoteService` | CRM | Forespørsler på skreddersydde løsninger og varianter |
| `CartService` | BFF | Handlekurven. Ligger i BFF-en, også når de andre tjenestene er ekte |
| `AssistantService` | LLMProxy | AI-funksjonene, se [04-ai.md](04-ai.md) |

`PricingService` og `InventoryService` er skilt fra katalogen fordi pris og lager kommer fra ERP, mens produktinformasjon kommer fra PIM. Det gjør det også mulig å cache katalogen lenge og hente pris og lager ferskt.

### Utkast til grensesnitt

Grensesnittene skrives i TypeScript med domenetyper som er uavhengige av mockene. Alle metoder er asynkrone, også i mocken, så de oppfører seg som nettverkskall.

```ts
// src/shop/services/catalog.ts
export interface CatalogService {
  listProducts(filter?: ProductFilter): Promise<ProductSummary[]>;
  getProduct(slug: string): Promise<Product | null>;
  getVariant(sku: string): Promise<{ product: Product; variant: Variant } | null>;
  listGroups(): Promise<ProductGroup[]>;
  search(query: string): Promise<ProductSummary[]>;
}

// src/shop/services/pricing.ts
export interface PricingService {
  /** Uten kunde gir den listepris. */
  getPrices(skus: string[], customerId?: string): Promise<Record<string, PriceInfo>>;
}

// src/shop/services/orders.ts
export interface OrderService {
  listOrders(customerId: string): Promise<OrderSummary[]>;
  getOrder(customerId: string, orderNumber: string): Promise<Order | null>;
  placeOrder(customerId: string, input: PlaceOrderInput): Promise<Order>;
}
```

`CustomerService`, `InventoryService`, `QuoteService` og `CartService` følger samme mønster.

### Domenetyper (utdrag)

| Type | Viktige felt |
|---|---|
| `Product` | `slug`, `name`, `shortDescription`, `description`, `images`, `group`, `materials`, `industries` (slugger), `properties`, `variants`, `salesUnit` |
| `Variant` | `sku`, `name`, `attributes` (f.eks. mål, farge), `unitsPerBundle`, `unitsPerPallet`, `onRequest` |
| `PriceInfo` | `currency`, `listPrice`, `customerPrice`, `tiers` (antall fra og pris per stk) |
| `Customer` | `id`, `name`, `orgNumber`, `addresses`, `users`, `priceAgreement` |
| `Order` | `orderNumber`, `createdAt`, `status`, `lines`, `deliveryAddress`, `poNumber`, `requestedDate`, `basedOn` (ordren den er variant av) |
| `OrderLine` | `sku` eller `customSpec`, `quantity`, `unitPrice` |
| `PackagingSpec` | `style` (FEFCO-kode), `innerDimensions` (mm), `board` (bølgetype), `color`, `print` (fase C) |

`Order.basedOn` og `OrderLine.customSpec` er med fra fase A, selv om de først tas i bruk i fase B og C. Da slipper vi å endre datamodellen senere.

## Produktdata

Produktkatalogen er kilden til produktdata (beslutning N4). I dag ligger 18 produkter i Sanity. bewifood.com har omtrent 100.

### Grunnlag fra bewifood.com

STOK eier rettighetene til innhold og bilder på bewifood.com (beslutning N12). Hver produktside har en varianttabell med ekte data. Eksempel fra Pers box:

| Art. nr. | Produktnavn | Lager/forespørsel | Ytre mål (cm) | Vekt | Materiale | Stk. per pall |
|---|---|---|---|---|---|---|
| 0280-1 | Pers box 70 l m/drenering | Forespørsel | 84.4 x 51.4 x 19 | 3.95 kg | HDPE | 20 |
| 0285-0 | Pers box 90 l | Forespørsel | 84.5 x 51.5 x 26.9 | 5.3 kg | HDPE | 16 |

Et engangsskript i `scripts/shop/` henter produktene og lager JSON-filen til mock-katalogen. Skriptet bruker produktlisten på `https://bewifood.com/emballasje/produkter?lang=no` og WordPress-API-et (`/wp-json/wp/v2/product-items`) til kategorier og bransjer. Resultatet sjekkes inn, så appen er uavhengig av bewifood.com når den kjører.

| Felt fra bewifood.com | Brukes som |
|---|---|
| Navn, ingress, beskrivelse, fordeler | `Product` |
| Kategorier (produktgruppe, bransje, materiale) | `group`, `industries`, `materials` |
| Rader i varianttabellen | `Variant` med varenummer, mål, vekt og stk. per pall |
| Lager/forespørsel | Startverdi for `InventoryService` og `Variant.onRequest` |
| Bilder | Lastes ned til `public/images/produkter/` |

Priser, buntstørrelser der de mangler, lagerantall og ordrehistorikk lager vi selv. Prisene settes ut fra materiale, størrelse og vekt, så de virker troverdige.

De 18 produktene som finnes på nettsiden, beholder sluggene sine fra Sanity. Da kan nettsidens produktsider lenke til «Se i nettbutikken» med samme slug. De andre får norske slugger laget fra navnet.

### Overgang for nettsiden

1. **Fase A:** Butikken bruker katalogen. Nettsiden bruker fortsatt Sanity.
2. **Fase N:** Nettsidens produktkatalog og produktsider viser alle produktene fra `CatalogService` (beslutning N11). Produktgrupper og materialer flyttes også. Sanity beholder bransjer, sider og moduler. Bransjesider viser produkter ved å spørre katalogen etter bransjeslug.
3. **Senere, ved behov:** Redaktører kan velge produkter fra katalogen i Sanity-moduler via en egen velger i Studio.

Til fase N er gjennomført, finnes 18 av produktene to steder.

## Ruter

Butikken ligger under `[market]`, men bare `no` er gyldig. Andre markeder gir 404.

| Rute | Innhold | Fase |
|---|---|---|
| `/no/butikk` | Butikkforside med produktgrupper, søk og utvalgte produkter | A |
| `/no/butikk/produkter?gruppe=…&q=…` | Produktliste med filter og søk | A |
| `/no/butikk/produkter/[slug]` | Produktside med variantvelger, pris, lager og «Legg i kurv» | A |
| `/no/butikk/handlekurv` | Handlekurv | A |
| `/no/butikk/kasse` | Leveringsadresse, innkjøpsnummer, leveringsdato | A |
| `/no/butikk/bekreftelse/[ordrenummer]` | Ordrebekreftelse | A |
| `/no/butikk/logg-inn` | Velger med demokunder | A |
| `/no/min-side` | Oversikt | B |
| `/no/min-side/ordre`, `/no/min-side/ordre/[ordrenummer]` | Ordrehistorikk og ordredetaljer, med «Gjenta» og «Lag variant» | B |
| `/no/min-side/emballasjer` | Mine emballasjer | B |
| `/no/butikk/konfigurator` | Konfigurator for skreddersydd kasse | C |

Butikken bruker samme layout, header og bunntekst som nettsiden. Headeren får en lenke til nettbutikken og et kurvikon med antall varer når markedet er `no`.

## Innlogging i demoen

`/no/butikk/logg-inn` viser de tre demokundene. Valget lagres i en httpOnly-cookie med kunde-ID. En hjelpefunksjon `getSession()` leser cookien på serveren og gir kunden eller `null`. Ekte innlogging (for eksempel Entra ID eller BankID for bedrift) erstatter bare `getSession()`.

Sider som avhenger av innlogget kunde, rendres dynamisk. Katalogdata kan fortsatt caches med `use cache`, mens pris og lager hentes per forespørsel.

## Lagring i demoen

| Data | Lagring |
|---|---|
| Katalog, priser, kunder og tidligere ordre | JSON-filer i `src/shop/mock/data/`, sjekket inn |
| Handlekurv | Cookie, per nettleser |
| Nye ordre og forespørsler | I minnet i mock-ordretjenesten |

Mock-ordretjenesten slår sammen ordrene fra JSON med ordrene som er lagt inn i demoen. Nye ordre ligger på `globalThis`, så de også overlever hot reload under utvikling.

På Vercel forsvinner nye ordre hvis plattformen starter en ny instans, for eksempel etter en stund uten trafikk (beslutning N8). Under en sammenhengende visning er det lite sannsynlig. Ordrene i mockdataene finnes alltid, og handlekurven ligger i nettleseren. Trenger vi varig lagring senere, legger vi den inn i mocken uten å endre `OrderService`.

En knapp på innloggingssiden nullstiller demoen og sletter nye ordre før en visning.

## Tekster

Faste UI-tekster i butikken legges i en egen ordbok, `src/shop/dictionary.ts`, med bare norsk. Det følger prinsippet i `src/lib/dictionaries.ts` uten å kreve islandske tekster for en del som bare finnes på norsk.

## Mappestruktur

```
src/
├── app/(site)/[market]/
│   ├── butikk/                Butikksidene
│   └── min-side/              Min side (fase B)
├── components/shop/           Komponenter for butikken
└── shop/
    ├── domain.ts              Domenetyper
    ├── services/              Grensesnitt
    ├── mock/                  Mock-implementasjoner
    │   └── data/              JSON med produkter, priser, kunder og ordre
    ├── session.ts             getSession() for demoinnlogging
    ├── cart.ts                Server actions for handlekurven
    ├── dictionary.ts          UI-tekster
    └── index.ts               Velger implementasjon
```
