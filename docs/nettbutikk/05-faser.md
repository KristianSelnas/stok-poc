# Faser

Hver fase avsluttes med noe som kan vises, og legger til en del av [demomanuset](01-mal-og-demomanus.md#demomanus). Vi starter med fase A og vurderer resten underveis. Fase N kan tas når som helst etter fase A.

| Fase | Innhold | Status |
|---|---|---|
| A | Tjenestelag, mockdata og klassisk butikk | Ferdig |
| B | Min side: ordrehistorikk, gjenta ordre og lag variant | Skissert |
| C | Konfigurator for skreddersydd kasse med pris og forhåndsvisning | Skissert |
| D | AI: emballasjeveileder, fritekst til spesifikasjon og variant med naturlig språk | Skissert |
| E | Utvidelser: bilde til emballasje, smart søk, bærekraft og prognose | Skissert |
| N | Nettsidens produktsider henter produkter fra katalogen | Skissert |

## Fase A: Tjenestelag og klassisk butikk

**Leveranse:** En demokunde logger inn, finner et produkt, ser sin avtalepris, legger varer i kurven og bestiller. Del 1 av demomanuset fungerer.

### A1. Domenetyper og grensesnitt

- [x] Domenetyper i `src/shop/domain.ts`, med `Order.basedOn` og `OrderLine.customSpec` fra start
- [x] Grensesnitt for `CatalogService`, `InventoryService`, `PricingService`, `CustomerService`, `OrderService` og `CartService`
- [x] `src/shop/index.ts` som gir mock-implementasjonene. Valget styres av miljøvariabelen `SHOP_BACKEND=mock`

### A2. Mockdata

- [x] Engangsskript i `scripts/shop/` som henter produktene fra bewifood.com (omtrent 100) med varianttabeller, kategorier og bilder, og skriver katalogen til JSON
- [x] Katalog: produkter med ekte varenumre, mål, vekt og stk. per pall. De 18 produktene på nettsiden beholder sluggene sine
- [x] Bilder lastet ned til `public/images/produkter/`
- [x] Lager: «Lager» og «Forespørsel» fra bewifood.com, med lagerantall og leveringstid lagt til
- [x] Priser: listepris per variant, mengderabatt per bunt og pall, og en rabattavtale per demokunde
- [x] Kunder: Havbris Sjømat, Lunde Bakeri og Nordlys Netthandel, med adresser og brukere
- [x] Ordrehistorikk: 8–15 ordre per kunde de siste 18 månedene. Lunde Bakeri får noen ordre på skreddersydde esker, til bruk i fase B

### A3. Mock-implementasjoner

- [x] Mock-tjenester som leser JSON-dataene
- [x] Kunstig forsinkelse på noen hundre millisekunder (kan slås av), så lastetilstander blir synlige
- [x] `OrderService.placeOrder` gir et nytt ordrenummer og lagrer ordren i minnet
- [x] Knapp for å nullstille demoen

### A4. Innlogging og handlekurv

- [x] `/no/butikk/logg-inn` med velger for demokundene, og utlogging
- [x] `getSession()` som leser kunden fra cookie
- [x] Handlekurv i cookie med server actions: legg til, endre antall, fjern
- [x] Kurvikon med antall i headeren

### A5. Butikksider

- [x] Butikkforside som også er katalogen: søk, «Kjøp igjen» for innlogget kunde, og alle produkter med filterknapper for produktgruppe, bransje og tilgjengelighet
- [x] `/no/butikk/produkter` sender videre til forsiden
- [x] Produktside med variantvelger, pris med mengderabatt, lagerstatus og «Legg i kurv». Antall rundes opp til hel bunt eller pall der det gjelder
- [x] Varer på forespørsel får knappen «Be om tilbud» i stedet for «Legg i kurv» (enkel versjon, sendes til `QuoteService` i fase C)
- [x] Handlekurv med summer, mva og frakt
- [x] Kasse med leveringsadresse, innkjøpsnummer, ønsket leveringsdato og merknad
- [x] Ordrebekreftelse

### A6. Kobling til nettsiden

- [x] Lenke til nettbutikken i headeren for `/no`
- [x] «Se i nettbutikken» på nettsidens produktsider når produktet finnes i katalogen
- [x] Butikken tilpasset STOKs profil og komponentene som finnes, med samme krav til tilgjengelighet som resten av siden

### A7. Dokumentasjon og kvalitet

- [x] Kort beskrivelse av tjenestelaget og hvordan man lager en ekte adapter, i `docs/nettbutikk/03-arkitektur.md`
- [x] `pnpm typecheck`, `pnpm lint` og `pnpm format:check` uten feil
- [x] Gå gjennom del 1 av demomanuset i nettleseren (Playwright, desktop og mobil)

**Merknader fra fase A:**

- Katalogen er laget fra bewifood.com med ekte varenumre, mål, vekt og stk. per pall. Hvordan «Lager» og «Forespørsel» er tolket, står i [03-arkitektur.md](03-arkitektur.md#tolkning-av-dataene-fra-bewifoodcom).
- Tre esker i bølgepapp er lagt til for demoen, fordi bewifood.com mangler dem. Nordlys Netthandel og konfiguratoren i fase C trenger dem.
- Priser, lager og 34 historiske ordre er generert av `scripts/shop/generate-mock-data.mts`. Lunde Bakeri har ordre på skreddersydde esker (blant annet 10327 med «Brødeske med logo, 400 x 300 x 150 mm») til fase B og D.
- Etter første gjennomgang ble produktlisten slått sammen med butikkens forside, og produktgruppene redusert fra 14 til 7. «Populære produkter» vises bare for besøkende som ikke er logget inn. Innloggede kunder ser «Kjøp igjen» i stedet.
- Antall rundes opp til hele bunter på serveren. Feltet godtar alle tall, og viser hva antallet blir rundet opp til.
- «Be om tilbud» lenker foreløpig til kontaktsiden. Det kobles til `QuoteService` i fase C.
- Ordrebekreftelsen bruker `?ordre=` i stedet for et dynamisk segment (se [03-arkitektur.md](03-arkitektur.md#ruter)).
- `tsconfig.json` har fått `allowImportingTsExtensions`, så skriptene i `scripts/shop/` kan importere `src/shop/mock/rules.ts` direkte med Node.
- Sanity Live gir CORS-feil i konsollen når appen kjører på en port som ikke er registrert i Sanity. Det påvirker ikke butikken.

## Fase B: Min side

- Ordrehistorikk og ordredetaljer
- Gjenta ordre: legger linjene i kurven, med varsel hvis en variant er utgått eller prisen er endret
- Lag variant: skjema med originalverdiene ferdig utfylt. Varianten lagres som original pluss endringer, så fase D kan lage den samme diffen
- Mine emballasjer, fakturaer, adresser og brukere

## Fase C: Konfigurator

- Konfigurator for de vanligste kassetypene (FEFCO 0201 og 0427) med mål, papp-kvalitet, farge og trykk
- Forhåndsvisning som tegnes på nytt ved endring. Vi vurderer SVG med utbrettet stansemønster mot en enkel 3D-kasse
- Regelmotor for estimert pris og leveringstid i mock-`QuoteService`
- Forespørsel til selger, som legges i mock-CRM

## Fase D: AI

- Avklare API-format og nøkkel mot LLMProxy
- `AssistantService` med `LlmAssistant` og `ScriptedAssistant`
- Emballasjeveileder i chatpanel
- Fritekst til spesifikasjon, som åpner konfiguratoren
- Variant med naturlig språk på ordresiden
- Brief til selger på forespørsler

## Fase E: Utvidelser

- Bilde til emballasje
- Smart søk
- Riktig størrelse og bærekraft
- Forbruksprognose på Min side
- Kundeserviceassistent

## Fase N: Nettsiden bruker produktkatalogen

- Nettsidens produktkatalog og produktsider viser alle produktene fra `CatalogService`
- Produktgrupper og materialer flyttes fra Sanity til katalogen
- Bransjesider viser produkter fra katalogen etter bransjeslug
- `product`, `productGroup` og `material` fjernes fra Sanity-skjemaet, og modulen «Produktrutenett» skrives om
- Sitemap, strukturerte data og forhåndsvisning oppdateres
