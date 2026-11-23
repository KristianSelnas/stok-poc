import type { FrontPage, Page } from "@/sanity/types";

import {
  cardGrid,
  ctaBanner,
  featureList,
  h2,
  hero,
  image,
  p,
  pageLink,
  pathLink,
  rich,
  richText,
} from "./builders";

/*
 * Islandsk reserveinnhold (beslutning B14 og B15). Tekstene er oversatt
 * maskinelt fra norsk og må kvalitetssikres av STOK.
 */

const contactCta = ctaBanner({
  title: "Vantar þig lausn í dag?",
  text: "Við eigum mikið úrval á lager og hjálpum þér að finna réttar umbúðir.",
  cta: pathLink("Hafðu samband", "/hafa-samband"),
  tone: "blue",
  image: image("pakkemaskin.jpg", "Pökkunarvél í framleiðslusal"),
});

export const frontPageIs: FrontPage = {
  seo: null,
  modules: [
    hero({
      eyebrow: "Umbúðir og ráðgjöf",
      title: "Við sköpum verðmæti með umbúðalausnum",
      lead: "STOK Emballage aðstoðar fyrirtæki við að velja réttar umbúðir, tryggja örugga afhendingu og draga úr sóun.",
      image: image("fabrikkskip.jpg", "Verksmiðjuskip á siglingu"),
      ctas: [pageLink("Um okkur", "um-okkur"), pathLink("Hafðu samband", "/hafa-samband")],
    }),
    featureList({
      eyebrow: "Umbúðasamstarfsaðili þinn",
      title: "Af hverju velja viðskiptavinir STOK",
      items: [
        { icon: "advice", title: "Ráðgjöf", text: "Við finnum umbúðir sem henta vörunni og ferlinu þínu." },
        {
          icon: "gear",
          title: "Hagkvæmur rekstur",
          text: "Réttar umbúðir þýða færri stopp og skilvirkari pökkun.",
        },
        {
          icon: "warehouse",
          title: "Birgðastýring",
          text: "Við geymum birgðir fyrir þig svo þú fáir vörurnar á réttum tíma.",
        },
        {
          icon: "shield",
          title: "Öryggi og þjónusta",
          text: "Fastur tengiliður og áreiðanlegar afhendingar.",
        },
      ],
    }),
    cardGrid({
      eyebrow: "Atvinnugreinar",
      title: "Lausnir fyrir þína atvinnugrein",
      columns: 2,
      cards: [
        {
          title: "Fiskur og sjávarafurðir",
          text: "Einangraðir kassar sem halda fiskinum ferskum frá skipi til verslunar.",
          image: image("laks-pa-is.jpg", "Lax á ís í hvítum fiskikassa"),
          link: pathLink("Lesa meira", "/atvinnugreinar/fiskur-og-sjavarafurdir"),
        },
        {
          title: "Matvæli",
          text: "Öruggar og rekjanlegar umbúðir fyrir kjöt, grænmeti og tilbúna rétti.",
          image: image("pakket-paprika.jpg", "Paprika í plastumbúðum í grænum kassa"),
          link: pathLink("Lesa meira", "/atvinnugreinar/matvaeli"),
        },
      ],
    }),
    contactCta,
  ],
};

export const pagesIs: Page[] = [
  {
    _id: "fallback-is-um-okkur",
    title: "Um okkur",
    slug: "um-okkur",
    seo: null,
    modules: [
      hero({
        eyebrow: "Um okkur",
        title: "Við verndum fólk og vörur fyrir betri hversdag",
        lead: "STOK Emballage þróar umbúðir fyrir matvælaiðnaðinn með áherslu á auðlindanýtingu og hringrásarhagkerfi.",
        image: image("medarbeidere.jpg", "Tveir brosandi starfsmenn í framleiðslu"),
      }),
      richText(
        rich(
          h2("Hlutverk okkar"),
          p(
            "Við sköpum verðmæti með því að bjóða sjálfbærar umbúðir á nýstárlegan og skilvirkan hátt. Vörur okkar vernda og einangra allt frá fiski og grænmeti til viðkvæmra vara.",
          ),
          h2("Hluti af STOK Group"),
          p(
            "STOK Group starfar í Danmörku, Noregi, Íslandi, Grænlandi og Þýskalandi. Það veitir viðskiptavinum okkar breiðara vöruúrval og aðgang að framleiðslu í mörgum löndum.",
          ),
        ),
      ),
      contactCta,
    ],
  },
];
