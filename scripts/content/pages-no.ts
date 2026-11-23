import type { FrontPage, Page } from "@/sanity/types";

import {
  cardGrid,
  ctaBanner,
  externalLink,
  featureList,
  h2,
  hero,
  image,
  lead,
  p,
  pageLink,
  pathLink,
  rich,
  richText,
  simple,
  textWithImage,
  ul,
} from "./builders";

/*
 * Norsk startinnhold. Tekstene bygger på bewifood.com og stok.dk, skrevet
 * om for STOK Emballage i Norge. Alt må kvalitetssikres av STOK før lansering.
 */

const contactCta = ctaBanner({
  title: "Trenger du en løsning i dag?",
  text: "Vi har et bredt sortiment på lager og hjelper deg å finne riktig emballasje.",
  cta: pathLink("Kontakt oss", "/kontakt"),
  tone: "blue",
  image: image("pakkemaskin.jpg", "Pakkemaskin i en produksjonshall"),
});

const industryCards = [
  {
    title: "Fisk og sjømat",
    text: "Isolerte kasser og emballasje som holder fisken fersk fra båt til butikk.",
    image: image("laks-pa-is.jpg", "Laks på is i en hvit fiskekasse"),
    link: pathLink("Les om fisk og sjømat", "/bransjer/fisk-og-sjomat"),
  },
  {
    title: "Næringsmiddel",
    text: "Trygg og sporbar emballasje for kjøtt, grønnsaker, meieri og ferdigmat.",
    image: image("pakket-paprika.jpg", "Paprika pakket i plastbeger i en grønn kasse"),
    link: pathLink("Les om næringsmiddel", "/bransjer/naeringsmiddel"),
  },
  {
    title: "Transport og lagring",
    text: "Kasser, paller og beskyttelse som tåler logistikkens krav.",
    image: image("transportkasser.jpg", "Stablede transportkasser på en pall"),
    link: pathLink("Les om transport og lagring", "/bransjer/transport-og-lagring"),
  },
];

export const frontPageNo: FrontPage = {
  seo: null,
  modules: [
    hero({
      eyebrow: "Emballasje og rådgivning",
      title: "Vi skaper verdi gjennom emballasjeløsninger",
      lead: "STOK Emballage hjelper norske virksomheter med riktig emballasje, sikker levering og mindre svinn. BEWI Food er nå en del av STOK.",
      image: image(
        "papp-pa-pall.jpg",
        "En medarbeider hos STOK kjører truck med en pall flat papp i testsenteret",
      ),
      ctas: [pageLink("Se våre løsninger", "losninger"), pathLink("Kontakt oss", "/kontakt")],
    }),
    featureList({
      eyebrow: "Din emballasjepartner",
      title: "Derfor velger kunder STOK",
      items: [
        {
          icon: "advice",
          title: "Rådgivning",
          text: "Vi finner emballasjen som passer produktet og prosessen din.",
        },
        {
          icon: "gear",
          title: "Optimal drift",
          text: "Riktig emballasje gir færre stopp og mer effektiv pakking.",
        },
        {
          icon: "warehouse",
          title: "Lagerstyring",
          text: "Vi holder lager for deg, så du får varene når du trenger dem.",
        },
        {
          icon: "shield",
          title: "Sikkerhet og service",
          text: "Fast kontaktperson og leveranser du kan stole på.",
        },
      ],
    }),
    cardGrid({
      eyebrow: "Bransjer",
      title: "Løsninger for din bransje",
      intro: "Vi kjenner kravene i bransjen din og leverer emballasje som passer.",
      cards: industryCards,
    }),
    textWithImage({
      eyebrow: "Nytt navn",
      title: "BEWI Food er nå STOK",
      body: simple(
        p(
          "I 2025 ble BEWI Food en del av STOK Group. Sammen er vi en av de ledende leverandørene av emballasje i Norden.",
        ),
        p(
          "Kundene våre møter de samme menneskene og det samme sortimentet. I tillegg får de tilgang til hele STOK-konsernets kompetanse og produksjon.",
        ),
      ),
      image: image("medarbeidere.jpg", "To smilende medarbeidere i produksjonen"),
      imagePosition: "left",
      cta: pageLink("Les mer om oss", "om-oss"),
    }),
    textWithImage({
      eyebrow: "Bærekraft",
      title: "Emballasje i et sirkulært kretsløp",
      body: simple(
        p(
          "Vi jobber for å redusere svinn, bruke mer resirkulert materiale og samle inn emballasje for gjenvinning.",
        ),
        ul("Mindre materiale per enhet", "Resirkulerbare løsninger", "Innsamling i samarbeid med kundene"),
      ),
      image: image("resirkulering.jpg", "To barn bærer en kasse med resirkuleringssymbol"),
      imagePosition: "right",
      cta: pageLink("Les om bærekraftsarbeidet", "baerekraft"),
    }),
    contactCta,
  ],
};

export const pagesNo: Page[] = [
  {
    _id: "fallback-no-losninger",
    title: "Løsninger",
    slug: "losninger",
    seo: {
      title: "Emballasjeløsninger",
      description: "Emballasje og rådgivning for fisk og sjømat, næringsmiddel, transport og industri.",
      image: null,
      noIndex: null,
    },
    modules: [
      hero({
        eyebrow: "Løsninger",
        title: "Emballasje tilpasset din virksomhet",
        lead: "Vi leverer alt fra fiskekasser og strekkfilm til komplette pakkelinjer. Velg bransje eller tjeneste for å lese mer.",
        image: image("salat-i-kasse.jpg", "Salat i en isolert kasse på en pall"),
      }),
      cardGrid({
        eyebrow: "Bransjer",
        title: "Velg din bransje",
        cards: [
          ...industryCards,
          {
            title: "Beskyttende emballasje",
            text: "Støtdemping og beskyttelse for skjøre og tunge varer.",
            link: pathLink("Les om beskyttende emballasje", "/bransjer/beskyttende-emballasje"),
          },
          {
            title: "Landbruk og industri",
            text: "Robuste løsninger for landbruk, industri og tekniske komponenter.",
            link: pathLink("Les om landbruk og industri", "/bransjer/landbruk-og-industri"),
          },
        ],
      }),
      cardGrid({
        eyebrow: "Tjenester",
        title: "Mer enn emballasje",
        columns: 2,
        cards: [
          {
            title: "Rådgivning",
            text: "Vi kartlegger behovet ditt og foreslår emballasje som gir lavere kostnader og mindre svinn.",
            image: image("radgivning-lager.jpg", "Tre personer i samtale på et lager"),
            link: pathLink("Les om rådgivning", "/tjenester/radgivning"),
          },
          {
            title: "Optimering",
            text: "Vi ser på hele pakkeprosessen, fra maskiner til pallestabling, og finner forbedringer.",
            image: image("pakkemaskin.jpg", "Pakkemaskin i en produksjonshall"),
            link: pathLink("Les om optimering", "/tjenester/optimering"),
          },
        ],
      }),
      contactCta,
    ],
  },
  {
    _id: "fallback-no-om-oss",
    title: "Om oss",
    slug: "om-oss",
    seo: {
      title: "Om STOK Emballage",
      description: "STOK Emballage er en nordisk emballasjeleverandør. BEWI Food er nå en del av STOK.",
      image: null,
      noIndex: null,
    },
    modules: [
      hero({
        eyebrow: "Om oss",
        title: "Vi beskytter mennesker og varer for en bedre hverdag",
        lead: "STOK Emballage utvikler emballasje for næringsmiddelindustrien. Vi legger vekt på ressurseffektivitet, mindre svinn og en sirkulær økonomi.",
        image: image("medarbeidere.jpg", "To smilende medarbeidere i produksjonen"),
      }),
      richText(
        rich(
          h2("Visjon"),
          p(
            "Vi tar ansvar for hele verdikjeden, fra råvare til ferdig produkt og tilbake til råvare. Målet er å lukke kretsløpet og gå foran i overgangen til en sirkulær økonomi.",
          ),
          h2("Vårt oppdrag"),
          lead("Vi skaper verdi ved å tilby bærekraftig emballasje på nyskapende og effektive måter."),
          p(
            "Produktene våre beskytter og isolerer alt fra fisk og grønnsaker til skjøre varer. Bærekraft styrer valgene våre i alle ledd: råvarer, design, produksjon, bruk og gjenbruk.",
          ),
          p(
            "Vi kombinerer teknologi og innovasjon med erfaring fra produksjon og drift. Slik utvikler vi nye bærekraftige løsninger sammen med kundene.",
          ),
        ),
      ),
      featureList({
        eyebrow: "Verdier",
        title: "Det vi står for",
        items: [
          { icon: "handshake", title: "Ansvarlig", text: "Vi tar ansvar for folk, miljø og samfunn." },
          { icon: "people", title: "Stolt", text: "Vi er stolte av jobben vi gjør og produktene vi lager." },
          { icon: "shield", title: "Stabil", text: "Kundene kan stole på oss, år etter år." },
          { icon: "check", title: "Kvalitetsbevisst", text: "Vi slipper ikke på kravene til kvalitet." },
        ],
      }),
      textWithImage({
        eyebrow: "STOK Group",
        title: "En del av et nordisk konsern",
        body: simple(
          p(
            "STOK Group har virksomhet i Danmark, Norge, Island, Grønland og Tyskland. Konsernet har vokst gjennom oppkjøp av blant annet Albe Emballage, Scan Lux Flexible og BEWI Food.",
          ),
          p("Det gir kundene våre et bredere sortiment og tilgang til egen produksjon i flere land."),
        ),
        image: image("fabrikkskip.jpg", "Fabrikkskip på vei inn mot land"),
        imagePosition: "right",
        cta: externalLink("Besøk STOK Group", "https://www.stok.dk"),
      }),
      ctaBanner({
        title: "Vil du jobbe hos oss?",
        text: "Vi ser etter folk som vil være med å utvikle fremtidens emballasje.",
        cta: pathLink("Se ledige stillinger", "/om-oss/karriere"),
        tone: "green",
      }),
    ],
  },
  {
    _id: "fallback-no-baerekraft",
    title: "Bærekraft",
    slug: "baerekraft",
    seo: {
      title: "Bærekraft",
      description: "Slik jobber STOK Emballage for en sirkulær økonomi og et inkluderende samfunn.",
      image: null,
      noIndex: null,
    },
    modules: [
      hero({
        eyebrow: "Bærekraft",
        title: "En sirkulær økonomi og et inkluderende samfunn",
        lead: "Vi har satt ambisiøse mål for hele verdikjeden fram mot 2030.",
        image: image("resirkulering.jpg", "To barn bærer en kasse med resirkuleringssymbol"),
      }),
      richText(
        rich(
          lead(
            "Som emballasjeleverandør vil vi skape verdi for kunder, samfunn og eiere. Bærekraftsarbeidet vårt hviler på tre pilarer.",
          ),
          ul(
            "**Bli sirkulær.** Vi skal drive en sirkulær virksomhet basert på fornybar energi.",
            "**Delta aktivt i partnerskap.** Sammen med kunder og partnere bygger vi en sirkulær økonomi innenfor planetens tålegrenser.",
            "**Bidra til et inkluderende samfunn.** Vi vil ha en positiv sosial effekt i hele verdikjeden.",
          ),
        ),
      ),
      featureList({
        eyebrow: "Satsingsområder",
        title: "Der vi gjør mest forskjell",
        items: [
          {
            icon: "handshake",
            title: "Bærekraftige innkjøp",
            text: "Vi stiller krav til leverandørene om ressurseffektivitet, sirkularitet og sosialt ansvar.",
          },
          {
            icon: "truck",
            title: "Distribusjon",
            text: "Vi optimaliserer ruter og lastegrad, og jobber for fossilfri transport.",
          },
          {
            icon: "recycle",
            title: "Innsamling og resirkulering",
            text: "Vi øker innsamlingen og hjelper kundene å sortere for materialgjenvinning.",
          },
          {
            icon: "people",
            title: "Inkluderende samfunn",
            text: "Vi engasjerer ansatte, partnere og naboer for bedre levekår i verdikjeden.",
          },
        ],
      }),
      textWithImage({
        eyebrow: "Etikk og etterlevelse",
        title: "Ansvarlig drift i hele verdikjeden",
        body: simple(
          p(
            "Vi følger gjeldende lover og regler der vi driver virksomhet. Våre etiske retningslinjer gjelder for ansatte, leverandører og partnere.",
          ),
          p(
            "Har du mistanke om kritikkverdige forhold, kan du varsle oss. Les mer om hvordan vi jobber med [åpenhetsloven](page:om-oss/apenhetsloven).",
          ),
        ),
        image: image("laksefilet.jpg", "Laksefilet på is"),
        imagePosition: "left",
      }),
      contactCta,
    ],
  },
  {
    _id: "fallback-no-apenhetsloven",
    title: "Åpenhetsloven",
    slug: "om-oss/apenhetsloven",
    seo: {
      title: "Åpenhetsloven",
      description: "Slik jobber STOK Emballage med menneskerettigheter og anstendige arbeidsforhold.",
      image: null,
      noIndex: null,
    },
    modules: [
      hero({
        eyebrow: "Om oss",
        title: "Åpenhetsloven",
        lead: "Vi jobber for å respektere menneskerettigheter og sikre anstendige arbeidsforhold hos oss og hos leverandørene våre.",
      }),
      richText(
        rich(
          h2("Hva loven krever"),
          p(
            "Åpenhetsloven trådte i kraft 1. juli 2022. Loven pålegger større virksomheter å gjennomføre aktsomhetsvurderinger og å svare på spørsmål om hvordan de håndterer risiko for brudd på menneskerettigheter.",
          ),
          h2("Slik jobber vi"),
          ul(
            "Vi kartlegger risiko i egen virksomhet og i leverandørkjeden.",
            "Vi stiller krav til leverandørene gjennom våre etiske retningslinjer.",
            "Vi følger opp avvik og iverksetter tiltak når vi finner risiko.",
            "Vi publiserer en årlig redegjørelse for aktsomhetsvurderingene.",
          ),
          h2("Be om informasjon"),
          p(
            "Alle har rett til å be om informasjon om hvordan vi håndterer faktiske og mulige negative konsekvenser. Send forespørselen til [kundeservice@bewifood.com](mailto:kundeservice@bewifood.com), så svarer vi innen tre uker.",
          ),
        ),
      ),
    ],
  },
];
