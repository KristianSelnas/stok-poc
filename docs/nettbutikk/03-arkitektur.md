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
| `/no/butikk?q=…&gruppe=…&bransje=…&vis=alle` | Butikkens forside og katalog: søk, «Kjøp igjen» og alle produkter med filterknapper | A |
| `/no/butikk/produkter` | Sender videre til `/no/butikk` med samme parametere | A |
| `/no/butikk/produkter/[slug]` | Produktside med variantvelger, pris, lager og «Legg i kurv» | A |
| `/no/butikk/handlekurv` | Handlekurv | A |
| `/no/butikk/kasse` | Leveringsadresse, innkjøpsnummer, leveringsdato | A |
| `/no/butikk/bekreftelse?ordre=…` | Ordrebekreftelse | A |
| `/no/butikk/logg-inn` | Velger med demokunder | A |
| `/no/min-side` | Oversikt | B |
| `/no/min-side/ordre`, `/no/min-side/ordre/[ordrenummer]` | Ordrehistorikk og ordredetaljer, med «Gjenta» og «Lag variant» | B |
| `/no/min-side/emballasjer` | Mine emballasjer | B |
| `/no/butikk/konfigurator` | Konfigurator for skreddersydd kasse | C |

Butikken bruker samme layout, header og bunntekst som nettsiden. Headeren får en lenke til nettbutikken og et kurvikon med antall varer når markedet er `no`.

Katalogen er slått sammen med butikkens forside. Med 103 produkter og sju grupper gir en egen listeside bare ett ekstra klikk. Filtrene er lenker med parametere i adressen, så de kan deles og fungerer uten JavaScript. Som standard vises bare varer som kan bestilles direkte. `vis=alle` tar med varer som krever tilbud.

Ordrebekreftelsen bruker en query-parameter i stedet for et dynamisk segment. Med Cache Components kan ikke menyen (som leser adressen med `usePathname`) prerendres på sider med parametere som er ukjente ved bygg. Ordresidene på Min side (fase B) må løse det samme, enten med query-parameter eller med `generateStaticParams` og Suspense rundt menyen.

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
    ├── services/              Grensesnitt, ett per bakenforliggende system
    ├── mock/                  Mock-implementasjoner
    │   ├── data/              JSON med produkter, priser, lager, kunder og ordre
    │   └── rules.ts           Regler for mengderabatt, avtalepris, frakt og mva
    ├── index.ts               shop(): velger implementasjon ut fra SHOP_BACKEND
    ├── queries.ts             Katalogdata med `use cache`
    ├── session.ts             getSession() for demoinnlogging
    ├── cart.ts                Handlekurven i cookie (CartService)
    ├── cart-view.ts           Kurven med produkt, pris og lager per linje
    ├── actions.ts             Server actions: innlogging, kurv og bestilling
    ├── paths.ts               shopPath() og productPath()
    ├── format.ts              Kroner, tall og datoer
    └── dictionary.ts          UI-tekster

scripts/shop/
├── fetch-bewifood.mts         Henter produkter og bilder fra bewifood.com
├── build-catalog.mts          Lager catalog.json fra rådataene, med tillegg for demoen
├── generate-mock-data.mts     Lager prices.json, inventory.json og orders.json
└── data/bewifood-raw.json     Rådata fra bewifood.com
```

## Slik bytter du en mock med et ekte system

1. Lag en adapter i `src/shop/adapters/`, for eksempel `adapters/erp/pricing.ts`, som oppfyller `PricingService` i `src/shop/services/pricing.ts`.
2. Oversett svarene fra systemet til domenetypene i `src/shop/domain.ts`. Adapteren er det eneste stedet som kjenner systemets format.
3. Koble adapteren inn i `src/shop/index.ts`, for eksempel med `SHOP_BACKEND=erp`. Tjenester kan byttes én og én, så det går fint å bruke ekte priser og mock-ordre samtidig.
4. Reglene i `src/shop/mock/rules.ts` gjelder bare mockene. Med ekte ERP kommer pris, rabatt, frakt og mva fra ERP. Klientkoden bruker `unitPriceFor` og `roundToBundle` fra samme fil til å vise pris for et antall. De funksjonene bør flyttes ut av `mock/` når en ekte prisadapter kommer.

Sider og server actions henter tjenestene med `shop()` og vet ikke hvilken implementasjon de får. Kunde-ID kommer alltid fra `getSession()` på serveren.

## Oppdatere mockdataene

```bash
node scripts/shop/fetch-bewifood.mts       # henter på nytt fra bewifood.com (mellomlager i scripts/shop/.cache)
node scripts/shop/build-catalog.mts        # lager catalog.json
node scripts/shop/generate-mock-data.mts   # lager priser, lager og ordre
```

Skriptene trenger ingen pakker utover Node 24. `generate-mock-data.mts` bruker en fast startverdi for tilfeldige tall, så den gir samme data hver gang.

### Tolkning av dataene fra bewifood.com

| bewifood.com | I katalogen |
|---|---|
| «Lager» i varianttabellen | Lagervare (`stock`): på lager, sendes innen 2 virkedager |
| «Forespørsel» i varianttabellen | Bestillingsvare (`madeToOrder`): kan bestilles, leveringstid 2–4 uker |
| Produkt uten varianttabell | Tilbud (`quote`): kundetilpasset, knappen «Be om tilbud» |

bewifood.com har 16 produktgrupper, og mange av dem har bare ett eller to produkter. Katalogen slår dem sammen til sju: Esker og kasser, Kar og spann, Brett, Sekker og film, Ark og beskyttelse, Transport og temperatur, og Tilbehør og maskiner.

Katalogen har 103 produkter og 235 varianter. 100 produkter kommer fra bewifood.com. Tre er lagt til for demoen fordi bewifood.com mangler esker i bølgepapp: Bølgepappeske (FEFCO 0201), Postboks (FEFCO 0427) og Flaskeeske. Seks forbruksvarer (pakketape, strekkfilm, strammebånd, polybags, palleark og pallehetter) har fått konkrete varianter. Tilleggene er merket med `source.name` = «STOK (tillegg for demo)».
