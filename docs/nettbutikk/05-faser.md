# Faser

Hver fase avsluttes med noe som kan vises, og legger til en del av [demomanuset](01-mal-og-demomanus.md#demomanus). Vi starter med fase A og vurderer resten underveis. Fase N kan tas når som helst etter fase A.

| Fase | Innhold | Status |
|---|---|---|
| A | Tjenestelag, mockdata og klassisk butikk | Ferdig |
| B | Min side: ordrehistorikk, gjenta ordre og lag variant | Ferdig |
| C | Konfigurator for skreddersydd kasse med pris og forhåndsvisning | Ferdig |
| D | AI: emballasjeveileder, fritekst til spesifikasjon og variant med naturlig språk | Skissert |
| E | Utvidelser: bilde til emballasje, smart søk, bærekraft og prognose | Skissert |
| N | Nettsidens produktsider henter produkter fra katalogen | Ferdig |

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
- Tre esker i bølgepapp ble lagt til for demoen, fordi bewifood.com mangler dem. De ble fjernet igjen i fase N, så katalogen bare har produkter fra bewifood.com.
- Priser, lager og 34 historiske ordre er generert av `scripts/shop/generate-mock-data.mts`. Lunde Bakeri har ordre på skreddersydde esker (blant annet 10329 med «Brødeske med logo, 400 x 300 x 150 mm») til fase B og D.
- Etter første gjennomgang ble produktlisten slått sammen med butikkens forside, og produktgruppene redusert fra 14 til 7. «Populære produkter» vises bare for besøkende som ikke er logget inn. Innloggede kunder ser «Kjøp igjen» i stedet.
- Antall rundes opp til hele bunter på serveren. Feltet godtar alle tall, og viser hva antallet blir rundet opp til.
- «Be om tilbud» lenker foreløpig til kontaktsiden. Det kobles til `QuoteService` i fase C.
- Ordrebekreftelsen bruker `?ordre=` i stedet for et dynamisk segment (se [03-arkitektur.md](03-arkitektur.md#ruter)).
- `tsconfig.json` har fått `allowImportingTsExtensions`, så skriptene i `scripts/shop/` kan importere `src/shop/mock/rules.ts` direkte med Node.
- Sanity Live gir CORS-feil i konsollen når appen kjører på en port som ikke er registrert i Sanity. Det påvirker ikke butikken.

## Fase B: Min side

**Leveranse:** Kunden ser ordrehistorikken, gjentar en ordre og lager en variant av en skreddersydd eske. Del 2 av demomanuset fungerer.

- [x] Oversikt med siste ordre, ubetalte fakturaer, emballasjer og forespørsler
- [x] Ordrehistorikk og ordredetaljer, med gjenkjøp og varianter merket
- [x] Gjenta ordre: legger katalogvarene i kurven og viser hvilken ordre de kom fra. Ordredetaljene varsler hvis prisen er endret eller varen ikke kan bestilles lenger
- [x] Lag variant av katalogvare: velg en annen variant av samme produkt og antall
- [x] Lag variant av skreddersydd emballasje: skjema med originalverdiene, endringer og foreløpig pris fortløpende. Lagres som forespørsel med original og endringer
- [x] `QuoteService` med mock i minnet, og siden Forespørsler
- [x] Mine emballasjer, samlet fra ordrehistorikken, med «Lag variant» og «Bestill på nytt»
- [x] Fakturaer (`OrderService.listInvoices`), og Firma og brukere med prisavtale og adresser
- [x] Lenke til Min side i butikklinjen når kunden er logget inn
- [x] Gå gjennom del 2 av demomanuset i nettleseren (Playwright, desktop og mobil)

**Merknader fra fase B:**

- Alle sider på Min side bruker query-parametere i stedet for dynamiske segmenter (`?ordre=10329`), av samme grunn som ordrebekreftelsen.
- Nye forespørsler ligger i minnet som nye ordre, og nullstilles med knappen på innloggingssiden.
- Skreddersydde linjer legges ikke i kurven ved gjenkjøp. «Bestill på nytt» åpner variantskjemaet uten endringer, så kunden sender en forespørsel på samme emballasje.
- Havbris' «Kartong laks 25 kg» er et tilbudsprodukt med varenummer. Den vises på ordren med beskjed om å bestille via «Be om tilbud», og regnes ikke som en av Mine emballasjer.
- Fakturaer, adresser og brukere kan bare leses. Endringer gjøres av kundeservice i demoen.

## Fase C: Konfigurator

**Leveranse:** Nordlys Netthandel lager en forsendelseseske etter egne mål, ser kassen tegnet på nytt mens målene endres, får estimert pris og leveringstid og sender en forespørsel til selger. Del 3 av demomanuset fungerer.

**Valg i fasen:**

- Forhåndsvisningen tegnes i SVG, med to visninger: en enkel 3D-kasse (skråprojeksjon) og et forenklet utbrettet stansemønster. Ingen nye pakker. En ekte 3D-modell (three.js) gir lite ekstra i demoen og koster mye.
- Pris og leveringstid regnes ut i `QuoteService.estimate` på serveren, ikke i nettleseren. Da kan avtalerabatten brukes, og en ekte adapter kan spørre ERP eller et kalkylesystem. Skjemaet spør serveren med en kort forsinkelse etter hver endring.
- Konfigurasjonen ligger i adressen (`?type=0201&l=400&b=300&h=200&…`). Da kan den deles, den overlever innlogging, og AI-en i fase D kan åpne konfiguratoren ferdig utfylt.
- Besøkende som ikke er logget inn, kan bruke konfiguratoren og ser veiledende pris. De må logge inn for å sende forespørselen.

### C1. Stansemønster og regler

- [x] `src/shop/dieline.ts`: utbrettet stansemønster for FEFCO 0201 og 0427 med paneler, kuttlinjer og rillelinjer, og arkstørrelsen. Uten avhengigheter, så både forhåndsvisningen og prisreglene bruker den
- [x] Grenser for mål og antall per kassetype, og felles validering i `src/shop/specs.ts`. Samme funksjon brukes i skjemaet og i server action
- [x] Regelmotor i `src/shop/mock/rules.ts`: pris per stk. ut fra arkareal, kvalitet, farge, trykk og antall, engangskostnad for stansekniv og trykkplater, avtalerabatt på esker og leveringstid

### C2. QuoteService

- [x] `QuoteService.estimate(customerId, spec, quantity)` som gir pris per stk., engangskostnad, sum, leveringstid og hvilke deler prisen består av
- [x] `QuoteRequest` får `estimatedToolingCost` og `estimatedLeadTimeDays`. Nye forespørsler fra konfiguratoren får estimatet fra regelmotoren, varianter som før
- [x] Siden Forespørsler viser engangskostnad og leveringstid når de finnes

### C3. Konfiguratoren

- [x] `/no/butikk/konfigurator` med valg av kassetype, mål, kvalitet, farge, trykk, antall og navn på emballasjen
- [x] Forhåndsvisning i SVG som tegnes på nytt ved hver endring, med valg mellom 3D og utbrettet. Mål vises på tegningen, og trykk vises som et logofelt
- [x] Estimert pris per stk., engangskostnad, sum og leveringstid, oppdatert fortløpende. Avtalepris for innloggede kunder
- [x] Konfigurasjonen speiles i adressen, og «Logg inn for å sende» tar den med tilbake
- [x] «Send forespørsel» lager en forespørsel i `QuoteService` og går til Forespørsler

### C4. Lenker inn til konfiguratoren

- [x] Kort om skreddersydd eske på butikkens forside
- [x] «Tilpass mål og trykk» på produktsidene til Bølgepappeske, Postboks og Flaskeeske, med målene fra valgt variant (eskene ble fjernet i fase N, se merknadene der)
- [x] Lenke i butikklinjen

### C5. Dokumentasjon og kvalitet

- [x] Regelmotoren, `estimate` og adresseformatet beskrevet i `03-arkitektur.md`
- [x] `pnpm typecheck`, `pnpm lint` og `pnpm format:check` uten feil
- [x] Gå gjennom del 3 av demomanuset i nettleseren (Playwright, desktop og mobil)

**Merknader fra fase C:**

- Kalkylen er stilt inn så en brun 400 x 300 x 200 mm amerikanereske koster omtrent som lagervaren (8,70 kr ved 1 000 stk.). 0427 får stansekniv som engangskostnad, 0201 ikke. Reglene står i [03-arkitektur.md](03-arkitektur.md#konfiguratoren).
- Minste antall er 250 stk. i konfiguratoren og 100 stk. i variantskjemaet på Min side, siden en variant gjenbruker verktøyet.
- Konfiguratoren har en `key` per kunde, så den starter på nytt med avtalepris etter innlogging.
- På mobil ligger tegningen over skjemaet. Den er ikke synlig mens kunden skriver inn mål lenger ned.
- Produktsiden leser nå sluggen inne i `<Suspense>`. Før ga `await params` øverst på siden feilen «Next.js encountered URL data during prerendering or a navigation» ved klientnavigasjon, fordi Partial Prefetching lager ett App Shell per rute. Feilen fantes fra fase A, men vises bare én gang per oppstart av dev-serveren. Ukjente slugger gir fortsatt siden «Siden finnes ikke», men med status 200 og `noindex` i stedet for 404, siden `notFound()` nå kalles etter at shellet er sendt.
- Playwright-MCP-en i sandkassen leter etter Chrome i `/opt/google/chrome/chrome`, som ikke finnes for Linux på ARM. En symbolsk lenke til Playwrights egen Chromium løser det.

**Utenfor fase C:** «Be om tilbud» på tilbudsprodukter som ikke er esker (for eksempel Pers box) lenker fortsatt til kontaktsiden. Det krever en forespørsel uten `PackagingSpec`, og passer bedre sammen med selger-briefen i fase D.

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

- [x] Nettsidens produktkatalog og produktsider viser alle produktene fra `CatalogService` (100 i `/no`, 6 i `/is`)
- [x] Produktgrupper, typer og materialer ligger i katalogen, med samme inndeling som bewifood.com (beslutning N15)
- [x] Bransjesider viser produktene i produktgruppene som peker på bransjen (`ProductGroup.industry`)
- [x] `product`, `productGroup` og `material` er fjernet fra Sanity-skjemaet, og modulen «Produktutvalg» velger type, produktgruppe eller bransje
- [x] Sitemap, strukturerte data og forhåndsvisning er oppdatert
- [x] Kjør `pnpm remove:products` mot Sanity-datasettet, så gamle produktdokumenter og referanser forsvinner

**Merknader fra fase N:**

- Filtrene følger bewifood.com: produktgruppe (Beskyttende emballasje, Fisk og sjømat, Handel, Mat, Medisinsk, Tekniske komponenter, Transport og lagring), type (16, f.eks. Eske, Sekk, Brett, Spann) og materiale (HDPE, Kartong, Annet). Bare fiskeproduktene har materiale, som på bewifood.com.
- Butikken har nedtrekkslister for type, produktgruppe og materiale. Adressene bruker `type`, `gruppe` og `materiale`, som nettsiden. Listen oppdateres når et valg endres, og produktene er gruppert etter type. Filteret på tilgjengelighet er fjernet, så alle produkter vises, også de som krever tilbud.
- Rabattavtalene gjelder per type (`typeDiscounts`). Prosentene er de samme som før, så priser og ordrehistorikk er uendret.
- Mat peker på bransjesiden Næringsmiddel, og Tekniske komponenter på Landbruk og industri. Handel og Medisinsk har ingen bransjeside.
- Det islandske markedet har sitt eget sortiment på bewifood.com. De seks produktene som lå i Sanity, ligger nå i `src/shop/mock/data/catalog-is.json`, med egne typer (Kassar og Pokar).
- Valglistene for type og produktgruppe i Studio kommer fra `src/shop/mock/data/taxonomy.json`, som `build-catalog.mts` lager. Med en ekte produktkatalog bør det bli en egen input i Studio.
- Bølgepappeske, Postboks og Flaskeeske er fjernet, fordi de ikke finnes på bewifood.com. Katalogen har nå 100 produkter. Variantene av pakketape, strekkfilm, strammebånd, polybags, palleark og pallehetter er beholdt, så de kan bestilles. «Tilpass mål og trykk» vises ikke lenger på produktsider, siden ingen katalogvare er en eske i bølgepapp. Konfiguratoren virker som før.
- Nordlys Netthandel har fått ny ordrehistorikk med forsendelsesesker og vinesker etter mål, gaveesker, pakketape og strekkfilm. `generate-mock-data.mts` gir nå hver variant og kunde sin egen strøm av tilfeldige tall. Derfor er alle priser, lagertall og ordre laget på nytt. Lunde Bakeris ordre med brødesken i demomanuset er nå 10329 (800 stk.).
- Teksten på Produkter-siden i Sanity nevner fortsatt «bransje» til `pnpm seed:content --replace` er kjørt, eller teksten er rettet i Studio.
