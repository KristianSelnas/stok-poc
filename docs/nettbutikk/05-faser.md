# Faser

Hver fase avsluttes med noe som kan vises, og legger til en del av [demomanuset](01-mal-og-demomanus.md#demomanus). Vi starter med fase A og vurderer resten underveis. Fase N kan tas når som helst etter fase A.

| Fase | Innhold | Status |
|---|---|---|
| A | Tjenestelag, mockdata og klassisk butikk | Planlagt |
| B | Min side: ordrehistorikk, gjenta ordre og lag variant | Skissert |
| C | Konfigurator for skreddersydd kasse med pris og forhåndsvisning | Skissert |
| D | AI: emballasjeveileder, fritekst til spesifikasjon og variant med naturlig språk | Skissert |
| E | Utvidelser: bilde til emballasje, smart søk, bærekraft og prognose | Skissert |
| N | Nettsidens produktsider henter produkter fra katalogen | Skissert |

## Fase A: Tjenestelag og klassisk butikk

**Leveranse:** En demokunde logger inn, finner et produkt, ser sin avtalepris, legger varer i kurven og bestiller. Del 1 av demomanuset fungerer.

### A1. Domenetyper og grensesnitt

- [ ] Domenetyper i `src/shop/domain.ts`, med `Order.basedOn` og `OrderLine.customSpec` fra start
- [ ] Grensesnitt for `CatalogService`, `InventoryService`, `PricingService`, `CustomerService`, `OrderService` og `CartService`
- [ ] `src/shop/index.ts` som gir mock-implementasjonene. Valget styres av miljøvariabelen `SHOP_BACKEND=mock`

### A2. Mockdata

- [ ] Engangsskript i `scripts/shop/` som henter produktene fra bewifood.com (omtrent 100) med varianttabeller, kategorier og bilder, og skriver katalogen til JSON
- [ ] Katalog: produkter med ekte varenumre, mål, vekt og stk. per pall. De 18 produktene på nettsiden beholder sluggene sine
- [ ] Bilder lastet ned til `public/images/produkter/`
- [ ] Lager: «Lager» og «Forespørsel» fra bewifood.com, med lagerantall og leveringstid lagt til
- [ ] Priser: listepris per variant, mengderabatt per bunt og pall, og en rabattavtale per demokunde
- [ ] Kunder: Havbris Sjømat, Lunde Bakeri og Nordlys Netthandel, med adresser og brukere
- [ ] Ordrehistorikk: 8–15 ordre per kunde de siste 18 månedene. Lunde Bakeri får noen ordre på skreddersydde esker, til bruk i fase B

### A3. Mock-implementasjoner

- [ ] Mock-tjenester som leser JSON-dataene
- [ ] Kunstig forsinkelse på noen hundre millisekunder (kan slås av), så lastetilstander blir synlige
- [ ] `OrderService.placeOrder` gir et nytt ordrenummer og lagrer ordren i minnet
- [ ] Knapp for å nullstille demoen

### A4. Innlogging og handlekurv

- [ ] `/no/butikk/logg-inn` med velger for demokundene, og utlogging
- [ ] `getSession()` som leser kunden fra cookie
- [ ] Handlekurv i cookie med server actions: legg til, endre antall, fjern
- [ ] Kurvikon med antall i headeren

### A5. Butikksider

- [ ] Butikkforside med produktgrupper og utvalgte produkter
- [ ] Produktliste med filter på produktgruppe og bransje, og enkelt søk i navn og varenummer
- [ ] Produktside med variantvelger, pris med mengderabatt, lagerstatus og «Legg i kurv». Antall rundes opp til hel bunt eller pall der det gjelder
- [ ] Varer på forespørsel får knappen «Be om tilbud» i stedet for «Legg i kurv» (enkel versjon, sendes til `QuoteService` i fase C)
- [ ] Handlekurv med summer, mva og frakt
- [ ] Kasse med leveringsadresse, innkjøpsnummer, ønsket leveringsdato og merknad
- [ ] Ordrebekreftelse

### A6. Kobling til nettsiden

- [ ] Lenke til nettbutikken i headeren for `/no`
- [ ] «Se i nettbutikken» på nettsidens produktsider når produktet finnes i katalogen
- [ ] Butikken tilpasset STOKs profil og komponentene som finnes, med samme krav til tilgjengelighet som resten av siden

### A7. Dokumentasjon og kvalitet

- [ ] Kort beskrivelse av tjenestelaget og hvordan man lager en ekte adapter, i `docs/nettbutikk/03-arkitektur.md`
- [ ] `pnpm typecheck`, `pnpm lint` og `pnpm format:check` uten feil
- [ ] Gå gjennom del 1 av demomanuset i nettleseren

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
