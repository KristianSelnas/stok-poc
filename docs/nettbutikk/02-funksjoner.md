# Funksjoner

Alle ideene fra idémyldringen, med fase og prioritet. Fasene er beskrevet i [05-faser.md](05-faser.md).

## Klassisk B2B-butikk

| Funksjon | Beskrivelse | Fase |
|---|---|---|
| Katalog med varianter | Ett produkt har flere varianter, for eksempel mål, farge eller drenering. Hver variant har eget varenummer | A |
| Avtalepriser og mengderabatt | Innlogget kunde ser sine egne priser. Prisen synker med antall: per stk, per bunt og per pall | A |
| Veiledende priser | Besøkere som ikke er logget inn, ser listepris og en oppfordring om å logge inn | A |
| Handlekurv | Kunden legger varianter i kurven og endrer antall. Antall rundes til hele bunter eller paller der varen selges slik | A |
| Kasse for B2B | Leveringsadresse fra kundens adresser, eget innkjøpsnummer, ønsket leveringsdato og faktura | A |
| Lager og leveringstid | Produktsiden viser om varen er på lager eller har leveringstid | A |
| Enkelt søk og filter | Søk i navn og varenummer, filter på produktgruppe og bransje | A |
| Kjøp igjen | Butikkens forside viser varene kunden oftest bestiller. Kunden legger dem i kurven med samme antall som sist | A |
| Hurtigbestilling | Kunden limer inn varenumre og antall, eller laster opp en Excel-liste | Senere |
| Tilbudsforespørsel | Skreddersydde løsninger og varer «på forespørsel» blir en forespørsel til selger | C |

## Min side

| Funksjon | Beskrivelse | Fase |
|---|---|---|
| Ordrehistorikk | Liste over ordre med status, og en detaljside per ordre | B |
| Gjenta ordre | Legger alle linjene i kurven med ett klikk. Kunden kan justere før bestilling | B |
| Lag variant | Skjema med verdiene fra originalen ferdig utfylt. Varianten lagres med kobling til originalen og viser hva som er endret | B |
| Mine emballasjer | Kundens egne skreddersydde løsninger med mål, trykkfil og siste pris | B |
| Fakturaer | Liste over fakturaer med status | B |
| Adresser og brukere | Kundens leveringsadresser og hvem i firmaet som kan bestille | B |
| Avrop fra lager | Kunden har varer på lager hos STOK og henter ut etter behov | Senere |
| Godkjenning av ordre | Ordre over et beløp må godkjennes av en annen bruker i firmaet | Senere |

## Skreddersydd emballasje

| Funksjon | Beskrivelse | Fase |
|---|---|---|
| Konfigurator | Kunden velger kassetype (FEFCO-kode), innvendige mål, papp-kvalitet, farge og trykk | C |
| Visuell forhåndsvisning | Kassen tegnes på nytt når målene endres, som 3D-kasse eller utbrettet stansemønster | C |
| Estimert pris og leveringstid | En regelmotor i mocken beregner pris ut fra areal, kvalitet, trykk og antall | C |
| Forespørsel til selger | Spesifikasjonen sendes som tilbudsforespørsel og legges i CRM | C |

## AI-funksjoner

Detaljert design står i [04-ai.md](04-ai.md).

| # | Funksjon | Kunden gjør | AI-en gjør | Fase |
|---|---|---|---|---|
| 1 | Emballasjeveileder | Beskriver hva som skal sendes eller lagres | Stiller oppfølgingsspørsmål og foreslår produkter eller en skreddersydd spesifikasjon | D |
| 2 | Fritekst til spesifikasjon | Beskriver behovet med egne ord | Fyller ut konfiguratoren. Kunden ser over og justerer | D |
| 3 | Variant med naturlig språk | «Samme som ordre 10329, men 20 cm dype» | Lager varianten og viser endringene og ny pris | D |
| 4 | Ferdig brief til selger | Sender en forespørsel | Lager et strukturert sammendrag til CRM | D |
| 5 | Bilde til emballasje | Tar bilde av varen med et A4-ark som målestokk | Anslår mål, form og hvor skjør varen er, og foreslår løsning | E |
| 6 | Smart søk | «isoporkasse til 10 kg laks» | Finner produkter selv om ordene ikke står i produktnavnet | E |
| 7 | Riktig størrelse og bærekraft | Ser på et produkt eller en spesifikasjon | Foreslår mindre kasse eller lettere papp, og viser sparte materialer og CO₂ | E |
| 8 | Forbruksprognose | Åpner Min side | Foreslår neste bestilling ut fra ordrehistorikken | E |
| 9 | Kundeserviceassistent | «Hvor er ordren min?» | Svarer ut fra ordre- og fakturadata | E |
| 10 | Opplasting av dokumenter | Laster opp en innkjøpsliste fra en annen leverandør | Finner tilsvarende produkter hos STOK | Senere |
