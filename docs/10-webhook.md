# Webhook for revalidering

Nettsiden cacher innhold fra Sanity i opptil én time. Når en redaktør publiserer, sender Sanity en webhook til `/api/revalidate`. Nettsiden tømmer da cachen for alt Sanity-innhold, og neste besøk viser det nye innholdet.

## Slik virker det

1. Redaktøren publiserer, endrer eller sletter et dokument i Studio.
2. Sanity sender `POST /api/revalidate` med `_id` og `_type`, signert med en felles hemmelighet.
3. Ruten sjekker signaturen og kaller `revalidateTag("sanity", { expire: 0 })`.
4. Neste besøk på en side henter innholdet på nytt fra Sanity.

Vi revaliderer alt innhold ved hver endring. Menyer og lenker viser adressene til andre dokumenter, så en målrettet revalidering ville lett gått glipp av sider som påvirkes. For en nettside av denne størrelsen koster det lite.

## Oppsett

### 1. Lag en hemmelighet

```bash
openssl rand -hex 32
```

Legg verdien inn som `SANITY_REVALIDATE_SECRET`:

- lokalt i `.env.local`
- i Vercel under Settings → Environment Variables

### 2. Opprett webhooken i Sanity

Gå til [sanity.io/manage](https://www.sanity.io/manage) → prosjektet `up8wp88l` → API → Webhooks → Create webhook.

| Felt | Verdi |
|---|---|
| Name | Revalider nettside |
| URL | `https://<domene>/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | (tomt, alle dokumenttyper) |
| Projection | `{_id, _type}` |
| HTTP method | POST |
| Drafts | Av |
| Secret | Verdien fra steg 1 |

### 3. Test

Publiser en endring i Studio. Under Webhooks → Attempts log i Sanity skal kallet ha status 200 med svaret `{"revalidated": true, ...}`. Last siden på nytt for å se endringen.

## Lokal utvikling

Sanity kan ikke nå `localhost`, så webhooken virker bare mot en deployet side. Lokalt holder innholdet seg i minnet til dev-serveren startes på nytt:

```bash
# Stopp med Ctrl+C og start igjen
pnpm dev
```

Vil du teste webhooken lokalt, kan du åpne en tunnel (f.eks. `cloudflared tunnel --url http://localhost:3000`) og bruke tunnel-URL-en i en egen webhook.

I fase 4 vurderer vi Sanity Live og Presentation-verktøyet. De gir forhåndsvisning og live-oppdatering i Studio, også lokalt.

## Feilsøking

| Svar fra `/api/revalidate` | Årsak |
|---|---|
| 401 Ugyldig signatur | Hemmeligheten i Sanity og `SANITY_REVALIDATE_SECRET` er ulike |
| 500 SANITY_REVALIDATE_SECRET mangler | Miljøvariabelen er ikke satt på serveren |
| 400 Mangler _type | Projection i webhooken mangler `_type` |
