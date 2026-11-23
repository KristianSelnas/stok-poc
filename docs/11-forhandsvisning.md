# Forhåndsvisning og live-oppdatering

Redaktøren forhåndsviser kladder i Studio under fanen **Forhåndsvisning** (Presentation-verktøyet). Klikker redaktøren på en tekst i forhåndsvisningen, åpnes feltet for redigering. Endringer vises mens redaktøren skriver.

## Slik virker det

1. Presentation-verktøyet åpner nettsiden i en iframe via `/api/draft-mode/enable`. Ruten sjekker en hemmelighet fra Studio og slår på Draft Mode.
2. I Draft Mode henter `lib/content.ts` kladder (`perspective: "drafts"`) med lesetokenet. Tekstene får usynlige stega-tegn som forteller hvilket dokument og felt teksten kommer fra.
3. `<VisualEditing />` tegner klikkbare rammer rundt tekstene.
4. Når redaktøren endrer en kladd, sender Studio en melding til siden. `PreviewEditing` henter da siden på nytt fra serveren, med de nye kladdene.

Nettleseren får aldri lesetokenet. `<SanityLive includeDrafts />` kunne oppdatert kladder direkte, men den trenger et token i nettleseren. Vi lar serveren hente kladdene i stedet.

Draft Mode krever ingen endringer i sidene. Next lar oss lese `draftMode()` inne i `use cache`, og i Draft Mode kjører funksjonene på nytt ved hvert besøk uten å lagre resultatet.

Utenfor Studio viser siden et banner nederst med knappen «Avslutt forhåndsvisning».

## Publisert innhold

`<SanityLive />` ligger på alle sider. Når noe publiseres, revaliderer den cachen for innholdet som endret seg, også lokalt. Webhooken i `/api/revalidate` er et sikkerhetsnett og tømmer all Sanity-cache (se [10-webhook.md](10-webhook.md)).

Publisert innhold hentes fra Sanitys API-CDN med `cacheMode: "noStale"`, slik `next-sanity` setter det opp. CDN-et gir da aldri utdatert innhold etter en publisering.

## Oppsett

### 1. Lesetoken

Gå til [sanity.io/manage](https://www.sanity.io/manage) → prosjektet `up8wp88l` → API → Tokens → Add API token. Velg rettigheten **Viewer**.

Legg tokenet inn som `SANITY_API_READ_TOKEN`:

- lokalt i `.env.local`
- i Vercel under Settings → Environment Variables

Tokenet brukes bare på serveren. Uten token viser forhåndsvisningen publisert innhold.

### 2. CORS

Nettleseren kobler seg til Sanity Live. Adressen til nettsiden må derfor ligge under API → CORS origins, med «Allow credentials». Det gjelder `http://localhost:3000` og Vercel-domenet.

## Koblinger mellom adresser og dokumenter

`src/sanity/presentation.ts` bestemmer to ting:

- Hvilket dokument som åpnes når redaktøren navigerer i forhåndsvisningen. `/no/bransjer/fisk-og-sjomat` åpner bransjen, `/no/om-oss` åpner siden.
- Hvor et dokument vises. Øverst i dokumentet står en lenke til siden i forhåndsvisningen.

Navigasjon og innstillinger vises på alle sider. De lenker til forsiden.

## Felt uten stega-tegn

Noen tekstfelt styrer logikk eller lenker, f.eks. bildeplassering, farge og telefonnummer. Usynlige tegn ville ødelagt dem. Sanity hopper selv over adresser, slugs, datoer og SEO-felt. Våre egne felt står i `stegaSkip` i `src/sanity/lib/client.ts`. Legger du til et felt med faste verdier, må det inn i listen.

Metadata (`<title>` og metatagger) renses med `stegaClean`.
