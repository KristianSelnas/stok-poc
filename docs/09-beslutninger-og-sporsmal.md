# Beslutninger og spørsmål

## Beslutninger

| # | Beslutning | Dato |
|---|---|---|
| B1 | Løsningen bygges med Next.js og Sanity | 23.11.2026 |
| B2 | Grafisk profil hentes fra stok.dk | 23.11.2026 |
| B3 | STOK Norge (tidligere BEWI Food) får en egen ny løsning, selv om stok.dk har norsk språkversjon | 23.11.2026 |
| B4 | Den nye løsningen erstatter bewifood.com, og norsk innhold hentes derfra | 23.11.2026 |
| B5 | Utviklingen starter først når planen er godkjent | 23.11.2026 |
| B6 | PoC-en tar med et utvalg på 15–20 produkter med filtre og produktsider | 23.11.2026 |
| B7 | Innhold hentes og omskrives fra bewifood.com, med stok.dk som mal for tone. Tekstene merkes for kvalitetssikring | 23.11.2026 |
| B8 | Profilen fra stok.dk brukes i et eget, nytt design med bedre kontrast | 23.11.2026 |
| B9 | Kantega eier Sanity-prosjektet og Vercel-prosjektet i PoC-en og kan overføre dem til STOK senere | 23.11.2026 |
| B10 | Løsningen dekker Norge og Island, med markedsvelger | 23.11.2026 |
| B11 | Siden bruker navnet «STOK Emballage» | 23.11.2026 |
| B12 | Koden ligger i et privat repo på Kantegas GitHub, koblet til Vercel | 23.11.2026 |
| B13 | Grønne knapper får mørk blå tekst (`#00405F`), som gir kontrast på ca. 5:1 | 23.11.2026 |
| B14 | Den islandske versjonen er på islandsk. Innhold hentes fra den islandske delen av bewifood.com, og resten oversettes maskinelt og merkes for kvalitetssikring | 23.11.2026 |
| B15 | Den islandske versjonen dekker forside, kontaktside, én bransjeside og noen produkter | 23.11.2026 |
| B16 | Markedene skilles med prefiks på ett domene (`/no`, `/is`) | 23.11.2026 |
| B17 | PoC-en bruker Sanity-prosjektet `up8wp88l` med datasettet `production` i alle miljøer. Et ekte prosjekt får en ny instans | 23.11.2026 |

## Åpne spørsmål

### Omfang

1. Hvilke bransjer skal løftes fram? Er listen fra bewifood.com fortsatt riktig etter sammenslåingen med STOK?
2. Er det en frist eller en demo vi jobber mot?

### Innhold

3. Finnes det kontaktpersoner hos STOK som kan kvalitetssikre de norske og islandske tekstene?
4. Har STOK rettigheter til bildene på bewifood.com, og kan vi bruke dem i en offentlig demo?
5. Hvor ligger produktdataene i dag (ERP, PIM eller bare på nettsiden)?

### Merkevare og design

6. Finnes det en profilmanual og logo i SVG?

### Teknisk

7. Hvilket domene skal PoC-en ligge på?
