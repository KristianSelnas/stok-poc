# Innholdsmodell i Sanity

Modellen kombinerer faste dokumenttyper for innhold med struktur (produkter, bransjer, nyheter, kontaktpersoner) og en modulbasert sidebygger for fleksible sider.

## Singletons

| Type | Felter |
|---|---|
| `siteSettings` | Sidetittel, logo, standard SEO, kontaktinfo, org.nr., sosiale medier, smiley-lenker |
| `navigation` | Hovedmeny (med grupper til mega-meny), bunntekstlenker, CTA-knapp i header |
| `frontPage` | Moduler og SEO. Ett dokument per marked |

## Dokumenttyper

| Type | Viktige felter | Kommentar |
|---|---|---|
| `page` | tittel, slug, forelder, moduler, SEO | Generelle sider (Om oss, bærekraft, åpenhetsloven) |
| `industry` | tittel, slug, ingress, hero-bilde, moduler, utvalgte produkter, SEO | Fisk og sjømat, næringsmiddel osv. |
| `productGroup` | navn, slug, beskrivelse, bilde, moduler, SEO | Eske, sekk, brett osv. Kan få egen landingsside med moduler, som kategorisidene på stok.dk |
| `product` | navn, slug, produktgruppe, bransjer, materialer, bilder, ingress, beskrivelse (Portable Text), egenskaper (nøkkel/verdi), datablad (fil), relaterte produkter, SEO | Ca. 100 produkter på bewifood.com |
| `material` | navn, slug | Brukes i filter |
| `service` | tittel, slug, ikon, ingress, moduler, SEO | Rådgivning, optimering |
| `newsArticle` | tittel, slug, dato, bilde, ingress, brødtekst (Portable Text), kategori, SEO | |
| `newsCategory` | navn, slug | Ny i forhold til stok.dk |
| `testimonial` | sitat, navn, rolle, firma, logo | Gjenbrukes på flere sider |
| `location` | navn, adresse, telefon, e-post, åpningstider, koordinater | Avdelinger i Norge |
| `certificate` | navn, beskrivelse, logo, PDF/lenke | FSC, ISO, FSSC 22000 osv. |
| `person` | navn, stilling, bilde, telefon, e-post, avdeling, område | Kontaktpersoner |
| `department` | navn, rekkefølge | Salg, backoffice, forsyningskjede, bærekraft og kvalitet, ledelse |

## Sidemoduler

Alle sidetyper med feltet `moduler` kan bruke disse. Hver modul har en React-komponent i `src/components/modules/`.

| Modul | Innhold | Brukes på stok.dk |
|---|---|---|
| `hero` | overskrift, undertittel, ingress, bilde/video, opptil to CTA-er | Alle sider |
| `richText` | Portable Text med bilder og lenker | Innholdssider |
| `textWithImage` | overskrift, tekst, bilde, bildeplassering (venstre/høyre), CTA | Kategori, bransje |
| `cardGrid` | overskrift, kort (manuelle eller referanser til kategori/bransje/tjeneste) | Tjenestekort, bransjefliser |
| `featureList` | overskrift, punkter med ikon, tittel, tekst, lenke | Fordeler på forside og bransjesider |
| `ctaBanner` | overskrift, tekst, bilde, knapp (lenke eller fil, f.eks. katalog) | «Har du brug for en løsning i dag?» |
| `testimonials` | utvalgte `testimonial`-referanser | Forside |
| `latestNews` | antall, valgfri kategori | Forside |
| `locations` | liste eller kart over `location` | Forside, kontakt |
| `logoRow` | logoer for sertifikater eller kunder | ESG |
| `contactForm` | overskrift, intro, mottaker | Kontakt |
| `productGrid` | overskrift, utvalg (manuelt, per gruppe eller per bransje) | Forside, bransjesider |
| `contactPeople` | overskrift, avdelinger eller utvalgte personer | Kontakt, bransjesider |
| `faq` | spørsmål og svar | Kan brukes på kategorisider |

## Felles objekttyper

- `link`: etikett og mål. Målet er en intern referanse til et dokument i samme språk, en sti eller en ekstern URL. Interne lenker bruker referanser, så de ikke brytes ved endring av slug.
- `linkAnnotation`: samme mål som `link`, men uten etikett. Brukes for lenker i rik tekst.
- `blockContent` og `simpleBlockContent`: rik tekst med og uten overskrifter og bilder
- `seo`: metatittel, metabeskrivelse, Open Graph-bilde, `noindex`
- `imageWithAlt`: bilde med påkrevd alternativ tekst, hotspot og crop

## Redaktøropplevelse

- Strukturert venstremeny i Studio: Innstillinger, Sider, Bransjer, Produkter, Nyheter, Kontaktpersoner, Gjenbrukbart innhold
- Forhåndsvisningsbilder for moduler, så redaktøren ser hva de velger
- Validering: påkrevde felt, maks lengde på metabeskrivelse, alt-tekst på bilder
- Presentation-verktøyet for klikk-for-å-redigere

## Språk

Løsningen dekker Norge (bokmål) og Island (beslutning B10). Vi bruker oversettelse på dokumentnivå med `@sanity/document-internationalization`:

- Hvert dokument har feltet `language` (`nb` eller `is`).
- Oversettelser av samme side kobles sammen, så siden kan lenke til motparten og sette `hreflang`.
- Et marked kan ha dokumenter uten motpart, for eksempel produkter eller kontaktpersoner som bare finnes på Island.
- `siteSettings` og `navigation` finnes i én versjon per marked.

Dokumentnivå passer bedre enn feltnivå her, fordi markedene trolig har ulikt innhold, ikke bare oversatte tekster.
