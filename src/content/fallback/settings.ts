import type { MarketId } from "@/lib/markets";
import type { Navigation, SiteSettings } from "@/sanity/types";

import { pageLink, pathLink } from "./builders";

/*
 * Kontaktinfo for Norge er hentet fra bewifood.com (kundeservice) og må
 * bekreftes av STOK. Islandske tekster må kvalitetssikres.
 */

export const fallbackSiteSettings: Record<MarketId, SiteSettings> = {
  no: {
    title: "STOK Emballage",
    description:
      "STOK Emballage leverer emballasje og rådgivning til norske virksomheter innen fisk og sjømat, næringsmiddel, industri og logistikk.",
    companyName: "STOK Emballage",
    orgNumber: null,
    address: null,
    phone: "+47 32 23 74 00",
    email: "kundeservice@bewifood.com",
    socialLinks: [],
  },
  is: {
    title: "STOK Emballage",
    description:
      "STOK Emballage býður umbúðir og ráðgjöf fyrir fyrirtæki í sjávarútvegi, matvælaiðnaði og flutningum.",
    companyName: "STOK Emballage",
    orgNumber: null,
    address: null,
    phone: null,
    email: null,
    socialLinks: [],
  },
};

let n = 0;
const k = (prefix: string) => `${prefix}-${++n}`;
const keyed = <T extends object>(value: T) => ({ _key: k("nav"), ...value });

export const fallbackNavigation: Record<MarketId, Navigation> = {
  no: {
    mainMenu: [
      {
        _key: "losninger",
        label: "Løsninger",
        link: pageLink("Alle løsninger", "losninger"),
        groups: [
          {
            _key: "bransjer",
            title: "Bransjer",
            links: [
              pathLink("Fisk og sjømat", "/bransjer/fisk-og-sjomat"),
              pathLink("Næringsmiddel", "/bransjer/naeringsmiddel"),
              pathLink("Beskyttende emballasje", "/bransjer/beskyttende-emballasje"),
              pathLink("Transport og lagring", "/bransjer/transport-og-lagring"),
              pathLink("Landbruk og industri", "/bransjer/landbruk-og-industri"),
            ].map(keyed),
          },
          {
            _key: "tjenester",
            title: "Tjenester",
            links: [
              pathLink("Rådgivning", "/tjenester/radgivning"),
              pathLink("Optimering", "/tjenester/optimering"),
            ].map(keyed),
          },
          {
            _key: "produkter",
            title: "Produkter",
            links: [pathLink("Alle produkter", "/produkter")].map(keyed),
          },
        ],
      },
      { _key: "produkter", label: "Produkter", link: pathLink("Produkter", "/produkter"), groups: null },
      { _key: "baerekraft", label: "Bærekraft", link: pageLink("Bærekraft", "baerekraft"), groups: null },
      { _key: "nyheter", label: "Nyheter", link: pathLink("Nyheter", "/nyheter"), groups: null },
      {
        _key: "om-oss",
        label: "Om oss",
        link: pageLink("Om STOK Emballage", "om-oss"),
        groups: [
          {
            _key: "selskapet",
            title: "Selskapet",
            links: [
              pageLink("Om STOK Emballage", "om-oss"),
              pathLink("Karriere", "/om-oss/karriere"),
              pageLink("Åpenhetsloven", "om-oss/apenhetsloven"),
            ].map(keyed),
          },
        ],
      },
    ],
    headerCta: pathLink("Kontakt oss", "/kontakt"),
    footerGroups: [
      {
        _key: "losninger",
        title: "Løsninger",
        links: [
          pathLink("Fisk og sjømat", "/bransjer/fisk-og-sjomat"),
          pathLink("Næringsmiddel", "/bransjer/naeringsmiddel"),
          pathLink("Transport og lagring", "/bransjer/transport-og-lagring"),
          pathLink("Alle produkter", "/produkter"),
        ].map(keyed),
      },
      {
        _key: "selskapet",
        title: "Selskapet",
        links: [
          pageLink("Om oss", "om-oss"),
          pathLink("Nyheter", "/nyheter"),
          pageLink("Bærekraft", "baerekraft"),
          pathLink("Karriere", "/om-oss/karriere"),
        ].map(keyed),
      },
    ],
    legalLinks: [
      pathLink("Personvern", "/personvern"),
      pathLink("Informasjonskapsler", "/informasjonskapsler"),
      pageLink("Åpenhetsloven", "om-oss/apenhetsloven"),
    ].map(keyed),
  },
  is: {
    mainMenu: [
      {
        _key: "lausnir",
        label: "Lausnir",
        link: pathLink("Allar lausnir", "/lausnir"),
        groups: [
          {
            _key: "atvinnugreinar",
            title: "Atvinnugreinar",
            links: [
              pathLink("Fiskur og sjávarafurðir", "/atvinnugreinar/fiskur-og-sjavarafurdir"),
              pathLink("Matvæli", "/atvinnugreinar/matvaeli"),
            ].map(keyed),
          },
          {
            _key: "vorur",
            title: "Vörur",
            links: [pathLink("Allar vörur", "/vorur")].map(keyed),
          },
        ],
      },
      { _key: "vorur", label: "Vörur", link: pathLink("Vörur", "/vorur"), groups: null },
      {
        _key: "sjalfbaerni",
        label: "Sjálfbærni",
        link: pathLink("Sjálfbærni", "/sjalfbaerni"),
        groups: null,
      },
      { _key: "frettir", label: "Fréttir", link: pathLink("Fréttir", "/frettir"), groups: null },
      { _key: "um-okkur", label: "Um okkur", link: pageLink("Um okkur", "um-okkur"), groups: null },
    ],
    headerCta: pathLink("Hafðu samband", "/hafa-samband"),
    footerGroups: [
      {
        _key: "lausnir",
        title: "Lausnir",
        links: [
          pathLink("Fiskur og sjávarafurðir", "/atvinnugreinar/fiskur-og-sjavarafurdir"),
          pathLink("Matvæli", "/atvinnugreinar/matvaeli"),
          pathLink("Allar vörur", "/vorur"),
        ].map(keyed),
      },
      {
        _key: "fyrirtaekid",
        title: "Fyrirtækið",
        links: [pageLink("Um okkur", "um-okkur"), pathLink("Fréttir", "/frettir")].map(keyed),
      },
    ],
    legalLinks: [pathLink("Persónuvernd", "/personuvernd"), pathLink("Vafrakökur", "/vafrakokur")].map(keyed),
  },
};
