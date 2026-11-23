# Analyse av stok.dk

Analysen er gjort 23. november 2026.

## Om virksomheten

STOK Emballage er en dansk leverandør av emballasje og rådgivning, med hovedkontor i Langeskov. Konsernet (STOK Group) har virksomhet i Danmark, Tyskland (Hünfeld), Island, Grønland (Nuuk) og Norge. I 2023 kjøpte STOK majoriteten i H. Clausen A/S, og konsernet har senere kjøpt blant annet Albe Emballage, Scan Lux Flexible, BEWI Food og KD Emballage.

## Plattform

Siden kjører på Squarespace. Det begrenser hvor mye vi kan gjenbruke direkte: vi gjenbruker profil, struktur og innholdstyper, og bygger komponentene på nytt.

## Hovedmeny

- **Emballageløsninger** (inngang til løsninger), med mega-meny gruppert slik:
  - *Efter emballage:* Bølgepap, Plastfolie, Strækfilm, Beskyttelse, Paller, Lukning, IBC/FIBC, Bølgeplast, Fleksibel emballage, Massiv pap, Konstruktion (Technofoam), Hård plast, Waste
  - *Efter anvendelse*
  - *Efter branche:* Fødevarer, Industri, Møbel & design, E-handel, Logistik, Handel
  - *Rådgivning, Optimering, Partnerskaber*
- **Emballagepartner**, med Display & POS (ekstern side)
- **ESG:** ESG i STOK, Certifikater, FSC, Miljø, Udvidet producentansvar, PPWR, Ecovadis
- **Om os:** Kassefabrik, Katalog, Nyheder, STOK Emballage, Whitepaper
- **Webshop** (ekstern)
- **Kontakt os** (knapp)

## Forsiden

1. Hero med verdiløfte og fire fordeler: rådgivning, optimal drift, lagerstyring, sikkerhet og service
2. Tjenester: rådgivning og optimering, utvikling og test, sikker levering, komplett sortiment
3. Kundesitater (Faerch, Unisport, Bodylab)
4. Tre siste nyheter
5. Bransjeløsninger som fliser
6. Kart over avdelinger
7. ESG-teaser
8. Bunntekst med kontaktinfo, sosiale medier, snarveier og smiley-rapporter

## Sidetyper vi ser

| Sidetype | Eksempel | Typiske seksjoner |
|---|---|---|
| Produktkategori | /boelgepap | Hero med CTA, intro, tjenestekort, tekst med bilde (vekslende), CTA-banner, bransjefliser |
| Bransje | /foedevarer | Hero, tekstblokker, funksjonsblokker med lenke, fordelsrutenett med ikoner |
| Nyhetsoversikt | /nyheder | Kortliste med bilde, dato, tittel, ingress. Ingen kategorier eller paginering |
| Nyhetsartikkel | – | Tittel, dato, bilde, brødtekst |
| Innholdsside | /esg, /fsc | Tekst, bilder, lenker |
| Kontakt | /kontakt-os | Kontaktinfo og avdelinger |

## Observasjoner

- Sidene gjenbruker de samme seksjonene. Det passer godt med en modulbasert sidebygger i Sanity.
- Bransjefliser og «relaterte kategorier» går igjen på mange sider. De bør hentes automatisk fra referanser, så redaktøren slipper å vedlikeholde dem manuelt.
- Nyhetene mangler kategorier. Vi kan legge til kategorier i den norske løsningen.
- Noen lenker er ødelagte (f.eks. «https://foedevarer»). Sanity med interne referanser hindrer dette.
- Navigasjonen er dyp. Mega-menyen bør forenkles for et mindre norsk marked.
