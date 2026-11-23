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
  },
} satisfies Record<MarketId, Record<string, string>>;

export type Dictionary = (typeof dictionaries)["no"];

export function getDictionary(market: MarketId): Dictionary {
  return dictionaries[market];
}
