/**
 * Islandske bransjer og sider for fase 3 (beslutning B15: forside, kontaktside,
 * én bransjeside og noen produkter). Tekstene er oversatt maskinelt fra norsk
 * og må kvalitetssikres av STOK.
 */
import {
  contactPeople,
  ctaBanner,
  featureList,
  hero,
  image,
  locations,
  newsList,
  p,
  pageLink,
  productCatalog,
  simple,
  textWithImage,
} from "../../src/content/fallback/builders";
import type { IndustryContent, PageContent } from "./structure-no";

const contactCta = ctaBanner({
  title: "Vantar þig ráðgjöf?",
  text: "Segðu okkur frá vörunni og ferlinu, og við finnum umbúðir sem henta.",
  cta: pageLink("Hafðu samband", "hafa-samband"),
  tone: "blue",
});

export const industriesIs: IndustryContent[] = [
  {
    title: "Fiskur og sjávarafurðir",
    slug: "fiskur-og-sjavarafurdir",
    heroTitle: "Umbúðir sem halda aflanum ferskum alla leið",
    lead: "Kassar, öskjur, pokar og filmur sem vernda fisk og sjávarafurðir frá skipi til verslunar.",
    image: image("laks-pa-is.jpg", "Lax á ís í hvítum fiskikassa"),
    modules: [
      featureList({
        eyebrow: "Samstarfsaðili sjávarútvegsins",
        title: "Af hverju velur sjávarútvegurinn STOK",
        items: [
          {
            icon: "advice",
            title: "Við hlustum og aðlögum",
            text: "Við vinnum náið með hverjum viðskiptavini að lausn sem hentar rekstrinum.",
          },
          {
            icon: "warehouse",
            title: "Vörurnar þegar þú þarft þær",
            text: "Við eigum vörurnar sem þú þarft á lager, líka á háannatíma.",
          },
          {
            icon: "box",
            title: "Rétt efni",
            text: "Kassar, öskjur, pokar og filmur fyrir ferskan, frosinn og saltaðan fisk.",
          },
        ],
      }),
      textWithImage({
        title: "Umbúðir fyrir ferskan, frosinn og saltaðan fisk",
        body: simple(
          p(
            "Ferskur fiskur krefst umbúða sem halda hitastigi og þola raka, salt og erfiða meðhöndlun. Við bjóðum kassa og öskjur fyrir saltfisk og flök, og poka fyrir frystar afurðir.",
          ),
        ),
        image: image("fabrikkskip.jpg", "Verksmiðjuskip á siglingu"),
        imagePosition: "right",
      }),
      contactCta,
    ],
    featuredProducts: [],
  },
];

export const pagesIs: PageContent[] = [
  {
    title: "Vörur",
    slug: "vorur",
    seo: null,
    modules: [
      hero({
        eyebrow: "Vörur",
        title: "Vörur",
        lead: "Úrval af umbúðum fyrir sjávarútveg. Hafðu samband ef þú finnur ekki það sem þú leitar að.",
      }),
      productCatalog(),
      contactCta,
    ],
  },
  {
    title: "Fréttir",
    slug: "frettir",
    seo: null,
    modules: [
      hero({ eyebrow: "Fréttir", title: "Fréttir", lead: "Nýjustu fréttir frá STOK Emballage." }),
      newsList(),
    ],
  },
  {
    title: "Hafðu samband",
    slug: "hafa-samband",
    seo: null,
    modules: [
      hero({
        eyebrow: "Hafðu samband",
        title: "Hafðu samband",
        lead: "Hringdu í þjónustuverið eða hafðu beint samband við starfsfólk okkar.",
      }),
      contactPeople({ showCustomerService: true }),
      locations({ title: "Skrifstofa" }),
    ],
  },
];
