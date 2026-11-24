# Mål og demomanus

## Mål

STOK skal få se hvordan en moderne B2B-nettbutikk for emballasje kan fungere. Demoen skal vise tre ting:

1. **En nettbutikk som fungerer.** Kunden logger inn, ser sine egne priser, finner produkter og bestiller.
2. **Gjenkjøp med lite friksjon.** Kunden gjentar en tidligere ordre eller lager en variant av den på Min side.
3. **AI som hjelper kunden.** Kunden beskriver behovet med egne ord eller med et bilde. AI-en foreslår produkter fra katalogen eller lager en spesifikasjon på en skreddersydd løsning.

Alle data er mocket. Grensesnittene mot mockene skal være så tydelige at STOK ser hvordan løsningen kobles til CRM, ERP og produktkatalog senere.

## Utenfor demoen

- Ekte betaling. Alle bestillinger er på faktura.
- Ekte innlogging. Vi bruker en velger med demokunder.
- Islandsk versjon av butikken.
- Integrasjon mot STOKs faktiske systemer.

## Demokunder

Tre fiktive kunder med ulike behov. Hver kunde har egne avtalepriser, adresser og ordrehistorikk.

| Kunde | Bransje | Typisk behov |
|---|---|---|
| **Havbris Sjømat AS**, Ålesund | Fisk og sjømat | Fiskekasser, filetbrett og isoporkasser i store volum. Bestiller jevnlig |
| **Lunde Bakeri AS**, Bergen | Næringsmiddel | Brødkasser og matkasser. Har noen skreddersydde esker med trykk |
| **Nordlys Netthandel AS**, Trondheim | E-handel | Forsendelsesesker i mange størrelser. Trenger ofte nye mål |

## Demomanus

Manuset viser hele flyten på 10–15 minutter. Hver fase legger til en del av manuset.

### Del 1: Klassisk handel (fase A)

1. Besøkeren går fra en produktside på nettsiden til nettbutikken via «Se i nettbutikken».
2. Uten innlogging ser besøkeren veiledende priser og en oppfordring om å logge inn.
3. Besøkeren logger inn som Havbris Sjømat. Prisene endres til avtalepriser med mengderabatt.
4. Kunden velger fiskekasse i riktig størrelse, legger 2 paller i kurven og bestiller med eget innkjøpsnummer og ønsket leveringsdato.
5. Kunden får en ordrebekreftelse med ordrenummer.

### Del 2: Min side (fase B)

1. Kunden åpner Min side og ser ordren fra del 1 øverst i ordrehistorikken.
2. Kunden gjentar en ordre fra i sommer med ett klikk og justerer antallet.
3. Kunden logger inn som Lunde Bakeri og åpner en tidligere ordre på en skreddersydd eske.
4. Kunden velger «Lag variant», endrer dybden fra 15 til 20 cm og sender en forespørsel. Varianten viser hva som er endret mot originalen.

### Del 3: Skreddersydd kasse (fase C)

1. Nordlys Netthandel åpner konfiguratoren og velger en forsendelseseske.
2. Kunden skriver inn mål, velger papp-kvalitet og trykk. Kassen tegnes på nytt mens kunden endrer.
3. Kunden ser estimert pris per stk og leveringstid, og sender en forespørsel til selger.

### Del 4: AI-assistent (fase D)

1. Nordlys Netthandel skriver: «Jeg skal sende 6 vinflasker med post, og pakken må tåle litt fukt.»
2. Assistenten stiller ett eller to oppfølgingsspørsmål og foreslår en eske fra katalogen og en skreddersydd variant.
3. Kunden velger den skreddersydde, og konfiguratoren åpnes med verdiene ferdig utfylt.
4. Lunde Bakeri skriver på Min side: «Samme som ordre 10482, men 20 cm dype og 500 stk.» Assistenten lager varianten og viser endringene.

### Del 5: Utvidelser (fase E)

1. Kunden tar bilde av en vare ved siden av et A4-ark. Assistenten anslår målene og foreslår emballasje.
2. Min side viser at Havbris Sjømat pleier å bestille fiskekasser hver 6. uke, og foreslår neste bestilling.
