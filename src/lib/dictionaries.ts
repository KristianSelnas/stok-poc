import type { MarketId } from "./markets";

/**
 * Faste UI-tekster som ikke redigeres i Sanity.
 * De islandske tekstene må kvalitetssikres av STOK.
 */
const dictionaries = {
  no: {
    skipToContent: "Hopp til innhold",
    mainNavigation: "Hovedmeny",
    openMenu: "Åpne meny",
    closeMenu: "Lukk meny",
    goTo: "Gå til",
    chooseMarket: "Velg marked",
    footerContact: "Kontakt",
    footerFollow: "Følg oss",
    orgNumber: "Org.nr.",
    home: "Forside",
    notFoundTitle: "Siden finnes ikke",
    notFoundText: "Siden du leter etter er flyttet eller finnes ikke lenger.",
    backHome: "Til forsiden",
    breadcrumbs: "Brødsmuler",
    // Produkter
    products: "Produkter",
    productGroup: "Produktgruppe",
    industry: "Bransje",
    material: "Materiale",
    all: "Alle",
    filterProducts: "Filtrer produkter",
    resetFilters: "Nullstill filtre",
    productsFound: "produkter",
    productFound: "produkt",
    noProducts: "Ingen produkter passer filteret.",
    properties: "Egenskaper",
    datasheet: "Last ned datablad",
    relatedProducts: "Relaterte produkter",
    askAboutProduct: "Spør om produktet",
    usedIn: "Brukes i",
    readMore: "Les mer",
    productsFor: "Produkter for",
    // Nyheter
    news: "Nyheter",
    moreNews: "Flere nyheter",
    published: "Publisert",
    noNews: "Ingen nyheter ennå.",
    // Kontakt
    customerService: "Kundeservice",
    phone: "Telefon",
    email: "E-post",
    sendEmail: "Send e-post",
    call: "Ring",
  },
  is: {
    skipToContent: "Fara beint í efni",
    mainNavigation: "Aðalvalmynd",
    openMenu: "Opna valmynd",
    closeMenu: "Loka valmynd",
    goTo: "Fara á",
    chooseMarket: "Veldu markað",
    footerContact: "Hafðu samband",
    footerFollow: "Fylgdu okkur",
    orgNumber: "Kt.",
    home: "Forsíða",
    notFoundTitle: "Síðan fannst ekki",
    notFoundText: "Síðan sem þú leitar að hefur verið færð eða er ekki lengur til.",
    backHome: "Á forsíðu",
    breadcrumbs: "Brauðmolar",
    // Vörur
    products: "Vörur",
    productGroup: "Vöruflokkur",
    industry: "Atvinnugrein",
    material: "Efni",
    all: "Allt",
    filterProducts: "Sía vörur",
    resetFilters: "Hreinsa síur",
    productsFound: "vörur",
    productFound: "vara",
    noProducts: "Engar vörur passa við síuna.",
    properties: "Eiginleikar",
    datasheet: "Sækja gagnablað",
    relatedProducts: "Tengdar vörur",
    askAboutProduct: "Spyrja um vöruna",
    usedIn: "Notað í",
    readMore: "Lesa meira",
    productsFor: "Vörur fyrir",
    // Fréttir
    news: "Fréttir",
    moreNews: "Fleiri fréttir",
    published: "Birt",
    noNews: "Engar fréttir enn.",
    // Hafa samband
    customerService: "Þjónustuver",
    phone: "Sími",
    email: "Netfang",
    sendEmail: "Senda tölvupóst",
    call: "Hringja",
  },
} satisfies Record<MarketId, Record<string, string>>;

export type Dictionary = (typeof dictionaries)["no"];

export function getDictionary(market: MarketId): Dictionary {
  return dictionaries[market];
}
