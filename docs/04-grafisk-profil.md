# Grafisk profil

Verdiene er hentet fra stilarkene på stok.dk 23. november 2026. Vi bør få bekreftet dem mot STOKs offisielle profilmanual hvis den finnes.

## Farger

| Rolle | Verdi | Kilde på stok.dk | Bruk |
|---|---|---|---|
| Primær (mørk blå) | `#00405F` | `--accent-hsl`, H3-farge | Overskrifter, header, mørke flater |
| Sekundær (grønn) | `#82C341` | `--darkAccent-hsl`, `.btn` | Knapper, ikoner, aksenter |
| Mørk grønn (tekst) | `#4A7A1C` | Ikke på stok.dk | Stikktitler og etiketter på lys bakgrunn. Gir minst 4,7:1 |
| Lys bakgrunn | `#F0F5FA` | `--lightAccent-hsl` | Seksjonsbakgrunner |
| Tekst | `#4A4A4A` | `--black-hsl` | Brødtekst |
| Hvit | `#FFFFFF` | `--white-hsl` | Bakgrunn, tekst på mørk flate |
| Lys grå | `#F6F6F6` | site.css | Kort og skillelinjer |

**Tilgjengelighet:** Hvit tekst på grønn `#82C341` gir for lav kontrast for vanlig tekst (ca. 2,2:1). Vi bruker derfor mørk blå tekst (`#00405F`) på grønne knapper, som gir ca. 5:1 (beslutning B13).

## Typografi

| Rolle | Font | Vekt |
|---|---|---|
| Overskrifter | Nunito | 600–700 |
| Brødtekst | Nunito | 300 (vi foreslår 400 for bedre lesbarhet) |
| Metatekst (dato, etiketter, knapper) | Poppins | 400 |

Begge fontene finnes på Google Fonts. Vi laster dem med `next/font`, så de ligger på vårt eget domene uten kall til Google.

## Logo

Logoen finnes i blå og grønn variant på stok.dk (`Stok_logo-blå-grøn@4x.png`). Siden bruker navnet «STOK Emballage» (beslutning B11). Vi trenger logoen som SVG fra STOK.

## Visuelt språk

- Runde, grønne ikoner og enkle strekillustrasjoner
- Bilder med avrundede former, blant annet halvsirkel-beskjæring av video
- Luftige seksjoner med maks innholdsbredde på 1400 px
- Knapper med god indre luft og grønn bakgrunn
- Kort med bilde, overskrift, kort tekst og «Les mer»-lenke

## Designtokens

Profilen legges inn som tokens i Tailwind-temaet, så alle komponenter bruker samme verdier:

```css
@theme {
  --color-stok-blue: #00405f;
  --color-stok-green: #82c341;
  --color-stok-light: #f0f5fa;
  --color-stok-text: #4a4a4a;
  --font-heading: var(--font-nunito);
  --font-body: var(--font-nunito);
  --font-meta: var(--font-poppins);
}
```

## Bilder

Bildene på stok.dk og bewifood.com tilhører STOK. PoC-en bruker bilder fra bewifood.com (beslutning B7), supplert med lisensfrie bilder der det mangler.
