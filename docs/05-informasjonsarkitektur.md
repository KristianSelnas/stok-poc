# Informasjonsarkitektur

Strukturen kombinerer sidetypene fra stok.dk med det norske innholdet fra bewifood.com. Alle URL-er har markedsprefiks: `/no/...` for Norge og `/is/...` for Island. Treet under viser den norske versjonen, med stier uten prefiks. Den islandske følger samme mønster, med egne slugs og egen meny.

## Hovedmeny

```
Løsninger                          /losninger
├── Bransjer
│   ├── Fisk og sjømat             /bransjer/fisk-og-sjomat
│   ├── Næringsmiddel              /bransjer/naeringsmiddel
│   ├── Beskyttende emballasje     /bransjer/beskyttende-emballasje
│   ├── Transport og lagring       /bransjer/transport-og-lagring
│   └── Landbruk og industri       /bransjer/landbruk-og-industri
├── Tjenester
│   ├── Rådgivning                 /tjenester/radgivning
│   └── Optimering                 /tjenester/optimering
└── Alle produkter                 /produkter
Produkter                          /produkter            (katalog med filtre)
└── Produkt                        /produkter/[produkt]
Bærekraft                          /baerekraft
Nyheter                            /nyheter
Om oss                             /om-oss
├── Karriere                       /om-oss/karriere
└── Åpenhetsloven                  /om-oss/apenhetsloven
[Kontakt oss]                      /kontakt
```

«Bransjer» og «Tjenester» er grupper i mega-menyen, ikke egne sider. Tjenester som Rådgivning og Optimering lages som vanlige sider (`page`) med adresser som `tjenester/radgivning`. Produktgrupper er filtre i katalogen, ikke egne sider. Endelig liste over bransjer og produktgrupper avhenger av hva STOK Norge vil løfte fram.

## Adresser per dokumenttype

Alle undersider går gjennom én catch-all-rute. Prefiksene er definert i `src/lib/routes.ts`.

| Type | Norge | Island |
|---|---|---|
| Side | `/no/<slug>` | `/is/<slug>` |
| Bransje | `/no/bransjer/<slug>` | `/is/atvinnugreinar/<slug>` |
| Produkt | `/no/produkter/<slug>` | `/is/vorur/<slug>` |
| Nyhet | `/no/nyheter/<slug>` | `/is/frettir/<slug>` |

Oversiktssidene (`/no/produkter`, `/no/nyheter`) er vanlige sider med modulene Produktkatalog og Nyhetsliste.

## Forside

1. Hero med verdiløfte, bilde og to CTA-er (løsninger, kontakt)
2. Fire fordeler med ikoner (som på stok.dk)
3. Bransjefliser
4. Utvalgte produkter eller produktgrupper
5. Kundesitater
6. Siste nyheter (tre stykker, hentes automatisk)
7. Bærekraft-teaser
8. Kontakt-CTA

## Produktkatalog

- Oversikt med filtre for produktgruppe, bransje og materiale
- Filtrene ligger i URL-en (`/produkter?gruppe=eske&bransje=fisk-og-sjomat`), så filtrerte visninger kan deles og indekseres
- Produktsiden viser bilder, beskrivelse, egenskaper, relaterte produkter og kontakt-CTA

## Kontakt

- Generell kundeservice øverst
- Kontaktpersoner gruppert etter avdeling, med filter for område
- Lokasjoner i Norge som liste (kart kan vurderes)
- Kontaktskjema

## Bunntekst

- Firmanavn, adresse, telefon, e-post, organisasjonsnummer
- Snarveier
- Sosiale medier
- Personvern, informasjonskapsler, kameraovervåking, åpenhetsloven
