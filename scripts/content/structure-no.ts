/**
 * Norske bransjer og sider for fase 3. Tekstene bygger på bewifood.com og er
 * skrevet om for STOK Emballage. Alt må kvalitetssikres av STOK.
 */
import {
  contactPeople,
  ctaBanner,
  docLink,
  featureList,
  hero,
  image,
  newsList,
  p,
  pageLink,
  productCatalog,
  remoteImage,
  rich,
  richText,
  simple,
  textWithImage,
} from "./builders";
import type { Industry, Page } from "../../src/sanity/types";

export type IndustryContent = Pick<
  Industry,
  "title" | "slug" | "heroTitle" | "lead" | "image" | "modules"
> & {
  slug: string;
  /** Slugs til produkter som vises nederst på siden. */
  featuredProducts: string[];
};

export type PageContent = Pick<Page, "title" | "modules" | "seo"> & { slug: string };

const contactCta = ctaBanner({
  title: "Usikker på hva du trenger?",
  text: "Fortell oss om produktet og prosessen din, så foreslår vi emballasje som passer.",
  cta: pageLink("Kontakt oss", "kontakt"),
  tone: "blue",
});

export const industriesNo: IndustryContent[] = [
  {
    title: "Fisk og sjømat",
    slug: "fisk-og-sjomat",
    heroTitle: "Emballasje som holder fangsten fersk hele veien",
    lead: "Kasser, kar, sekker og film som beskytter fisk og sjømat fra båt og anlegg til butikk. Og pakkemaskiner som effektiviserer produksjonen.",
    image: image("laks-pa-is.jpg", "Laks på is i en hvit fiskekasse"),
    modules: [
      featureList({
        eyebrow: "Din partner i sjømatnæringen",
        title: "Derfor velger sjømatnæringen STOK",
        items: [
          {
            icon: "advice",
            title: "Vi lytter og tilpasser",
            text: "Vi jobber tett med hver kunde for å finne løsningen som passer driften.",
          },
          {
            icon: "warehouse",
            title: "Produktene når du trenger dem",
            text: "Vi har produktene du trenger på lager, også i sesongtoppene.",
          },
          {
            icon: "box",
            title: "Riktig materiale",
            text: "HDPE, kartong, film og sekker til fersk, fryst og saltet fisk.",
          },
          {
            icon: "recycle",
            title: "Gjenbruk",
            text: "Kasser og kar som tåler tøff bruk i mange år.",
          },
        ],
      }),
      textWithImage({
        eyebrow: "Fra fangst til frysedisk",
        title: "Emballasje for fersk, fryst og saltet fisk",
        body: simple(
          p(
            "Fersk fisk krever emballasje som holder temperaturen og tåler fukt, salt og hard håndtering. Vi leverer kasser og kar i HDPE til fersk fisk, kartonger til saltfisk og sekker og film til frysevarer.",
          ),
          p(
            "For fabrikkskip og anlegg på land leverer vi også pakkemaskiner som pakker frosne fiskeblokker helautomatisk.",
          ),
        ),
        image: image("fabrikkskip.jpg", "Fabrikkskip på vei inn mot land"),
        imagePosition: "right",
        cta: docLink("Se pakkemaskinen A1", "product", "pakkemaskin-a1"),
      }),
      contactCta,
    ],
    featuredProducts: [
      "fiskekasse",
      "fiskekar",
      "kartong-for-saltfisk",
      "filetbrett",
      "nordic-bags",
      "fleksible-filmer",
      "pallekarmer",
      "pakkemaskin-a1",
    ],
  },
  {
    title: "Næringsmiddel",
    slug: "naeringsmiddel",
    heroTitle: "Trygg emballasje for mat",
    lead: "Kasser, brett og spann for kjøtt, bakevarer, grønnsaker og frukt. Emballasjen beskytter maten og gjør logistikken enklere.",
    image: image("salat-i-kasse.jpg", "Salat i en isolert kasse på en pall"),
    modules: [
      textWithImage({
        eyebrow: "Høy beskyttelse",
        title: "Varene kommer fram i god stand",
        body: simple(
          p(
            "Emballasjen vår tåler høyt trykk, så varene kommer fram i best mulig stand. Vi hjelper deg å finne løsningen som gir minst skade og svinn.",
          ),
        ),
        image: remoteImage(
          "https://bewifood.com/wp-content/uploads/2021/02/IMG_1263-1.jpg",
          "Grønnsaker pakket i kasser",
        ),
        imagePosition: "right",
      }),
      textWithImage({
        eyebrow: "Tåler fukt",
        title: "Plast som beskytter ferske varer",
        body: simple(
          p(
            "Plast trekker ikke til seg fuktighet fra lufta. Det betyr mye for grønnsaker, frukt og bakevarer, som er følsomme for fukt.",
          ),
        ),
        image: image("pakket-paprika.jpg", "Paprika pakket i plastbeger i en grønn kasse"),
        imagePosition: "left",
      }),
      featureList({
        eyebrow: "Tilpasset hver bransje",
        title: "Emballasje for ulike deler av matbransjen",
        items: [
          {
            icon: "box",
            title: "Kjøtt",
            text: "Stablebare transportkasser som kjøttindustrien foretrekker.",
          },
          { icon: "box", title: "Bakeri", text: "Brødkasser designet for bakeriindustrien." },
          { icon: "leaf", title: "Frukt og grønt", text: "Brett og kasser som beskytter ømfintlige varer." },
          { icon: "check", title: "Meieri og ferdigmat", text: "Spann og dunker for nesten alle produkter." },
        ],
      }),
      contactCta,
    ],
    featuredProducts: ["matkasse", "brodkasser", "spann-dunker", "kvantum-brett"],
  },
  {
    title: "Beskyttende emballasje",
    slug: "beskyttende-emballasje",
    heroTitle: "Den klokeste måten å beskytte det du pakker",
    lead: "Støtdempende emballasje i den formen du trenger, når du trenger den.",
    image: remoteImage(
      "https://bewifood.com/wp-content/uploads/2021/04/Cellpack-H-110-scaled.jpg",
      "Honeycomb-plate i papir",
    ),
    modules: [
      textWithImage({
        eyebrow: "Honeycomb",
        title: "Sterkt, lett og resirkulerbart",
        body: simple(
          p(
            "Honeycomb er laget av papir, kraftliner eller testliner. Den luftfylte cellestrukturen gjør materialet sterkere og lettere enn papp, og det demper støt for skjøre produkter.",
          ),
          p("Honeycomb er 100 % resirkulerbart og biologisk nedbrytbart, og kan komprimeres for frakt."),
        ),
        image: remoteImage(
          "https://bewifood.com/wp-content/uploads/2021/04/Cellpack-H-110-scaled.jpg",
          "Honeycomb-plate i papir",
        ),
        imagePosition: "right",
        cta: docLink("Se honeycomb", "product", "honeycomb"),
      }),
      textWithImage({
        eyebrow: "Tilskåret skum",
        title: "Skreddersydd etter dine mål",
        body: simple(
          p(
            "Skumemballasje i EPE eller PUR, tilskåret etter dine mål. Vi former materialet uten kostbare støpeformer. Det gir kort leveringstid og lavere kostnad, også i små serier.",
          ),
        ),
        image: remoteImage(
          "https://bewifood.com/wp-content/uploads/2021/05/fabricated-foam-1.jpg",
          "Tilskåret skumemballasje",
        ),
        imagePosition: "left",
      }),
      contactCta,
    ],
    featuredProducts: ["honeycomb", "sherpa-systems"],
  },
  {
    title: "Transport og lagring",
    slug: "transport-og-lagring",
    heroTitle: "Smarte løsninger som sparer plass, tid og penger",
    lead: "Forenkle og effektiviser logistikken med kasser, brett og paller som tåler daglig bruk.",
    image: image("transportkasser.jpg", "Stablede transportkasser på en pall"),
    modules: [
      featureList({
        eyebrow: "Logistikk",
        title: "Enklere og tryggere logistikk",
        items: [
          {
            icon: "warehouse",
            title: "Spar plass",
            text: "Stablebare og nestbare kasser tar mindre plass, både fulle og tomme.",
          },
          {
            icon: "gear",
            title: "Jevnere flyt",
            text: "Standardiserte mål gjør håndtering og automatisering enklere.",
          },
          {
            icon: "shield",
            title: "Færre ulykker",
            text: "Robuste løsninger gir tryggere håndtering på lager og i transport.",
          },
          {
            icon: "recycle",
            title: "Bra for deg og planeten",
            text: "Gjenbrukbar emballasje gir mindre avfall over tid.",
          },
        ],
      }),
      textWithImage({
        title: "Transport- og lagringsløsninger du kan stole på",
        body: simple(
          p(
            "Vi leverer stablebare transportkasser, trillebrett, pallekarmer og godkjente beholdere for farlig avfall.",
          ),
        ),
        image: image("radgivning-lager.jpg", "Tre personer i samtale på et lager"),
        imagePosition: "right",
      }),
      contactCta,
    ],
    featuredProducts: ["stablebar-transportkasse", "trillebrett", "pallekarmer", "avfallsbeholdere"],
  },
  {
    title: "Landbruk og industri",
    slug: "landbruk-og-industri",
    heroTitle: "Robuste løsninger for landbruk og industri",
    lead: "Emballasje og transportløsninger for landbruk, industri og tekniske komponenter.",
    image: image("pakkemaskin.jpg", "Pakkemaskin i en produksjonshall"),
    modules: [
      richText(
        rich(
          p(
            "Vi leverer kasser, brett, paller og beskyttende emballasje til landbruk og industri. Fortell oss om produktene og prosessene dine, så finner vi løsningen som passer.",
          ),
        ),
      ),
      contactCta,
    ],
    featuredProducts: ["stablebar-transportkasse", "honeycomb", "spann-dunker", "trillebrett"],
  },
];

export const pagesNo: PageContent[] = [
  {
    title: "Produkter",
    slug: "produkter",
    seo: {
      title: "Produkter",
      description:
        "Emballasje til fisk og sjømat, næringsmiddel, transport og industri. Filtrer på gruppe, bransje og materiale.",
      image: null,
      noIndex: null,
    },
    modules: [
      hero({
        eyebrow: "Produkter",
        title: "Produkter",
        lead: "Et utvalg av emballasjen vi leverer. Filtrer på produktgruppe, bransje eller materiale. Finner du ikke det du leter etter, hjelper vi deg gjerne.",
      }),
      productCatalog(),
      contactCta,
    ],
  },
  {
    title: "Nyheter",
    slug: "nyheter",
    seo: {
      title: "Nyheter",
      description: "Siste nytt fra STOK Emballage og STOK Group.",
      image: null,
      noIndex: null,
    },
    modules: [
      hero({
        eyebrow: "Nyheter",
        title: "Nyheter og historier",
        lead: "Siste nytt fra STOK Emballage og STOK Group.",
      }),
      newsList(),
    ],
  },
  {
    title: "Kontakt oss",
    slug: "kontakt",
    seo: {
      title: "Kontakt oss",
      description: "Kontakt kundeservice eller en av våre medarbeidere i STOK Emballage.",
      image: null,
      noIndex: null,
    },
    modules: [
      hero({
        eyebrow: "Kontakt",
        title: "Kontakt oss",
        lead: "Ring kundeservice eller ta direkte kontakt med en av oss. Vi hjelper deg gjerne.",
      }),
      contactPeople({ showCustomerService: true }),
    ],
  },
];

/** Modul som legges til på forsiden hvis den ikke har en nyhetsliste fra før. */
export const frontPageNewsNo = newsList({
  eyebrow: "Nyheter",
  title: "Siste nytt",
  limit: 3,
  cta: pageLink("Se alle nyheter", "nyheter"),
});
