import type { MarketId } from "@/lib/markets";
import type { Navigation, SiteSettings } from "@/sanity/types";

/**
 * Reserveinnhold som brukes når Sanity ikke er koblet til.
 * Speiler strukturen i Sanity, så det kan importeres som startinnhold senere.
 *
 * Kontaktinfo for Norge er hentet fra bewifood.com (kundeservice) og må
 * bekreftes av STOK. Islandske tekster må kvalitetssikres.
 */

const link = (key: string, label: string, path: string) => ({
  _key: key,
  label,
  linkType: "path" as const,
  path,
});

export const fallbackSiteSettings: Record<MarketId, SiteSettings> = {
  no: {
    title: "STOK Emballage",
    description:
      "STOK Emballage leverer emballasje og rådgivning til norske virksomheter innen fisk og sjømat, næringsmiddel, industri og logistikk.",
    companyName: "STOK Emballage",
    phone: "+47 32 23 74 00",
    email: "kundeservice@bewifood.com",
    socialLinks: [],
  },
  is: {
    title: "STOK Emballage",
    description:
      "STOK Emballage býður umbúðir og ráðgjöf fyrir fyrirtæki í sjávarútvegi, matvælaiðnaði og flutningum.",
    companyName: "STOK Emballage",
    socialLinks: [],
  },
};

export const fallbackNavigation: Record<MarketId, Navigation> = {
  no: {
    mainMenu: [
      {
        _key: "losninger",
        label: "Løsninger",
        link: { label: "Alle løsninger", linkType: "path", path: "/losninger" },
        groups: [
          {
            _key: "bransjer",
            title: "Bransjer",
            links: [
              link("fisk", "Fisk og sjømat", "/bransjer/fisk-og-sjomat"),
              link("naeringsmiddel", "Næringsmiddel", "/bransjer/naeringsmiddel"),
              link("beskyttende", "Beskyttende emballasje", "/bransjer/beskyttende-emballasje"),
              link("transport", "Transport og lagring", "/bransjer/transport-og-lagring"),
              link("landbruk", "Landbruk og industri", "/bransjer/landbruk-og-industri"),
            ],
          },
          {
            _key: "tjenester",
            title: "Tjenester",
            links: [
              link("radgivning", "Rådgivning", "/tjenester/radgivning"),
              link("optimering", "Optimering", "/tjenester/optimering"),
            ],
          },
          {
            _key: "produkter",
            title: "Produkter",
            links: [link("alle-produkter", "Alle produkter", "/produkter")],
          },
        ],
      },
      {
        _key: "produkter",
        label: "Produkter",
        link: { label: "Produkter", linkType: "path", path: "/produkter" },
      },
      {
        _key: "baerekraft",
        label: "Bærekraft",
        link: { label: "Bærekraft", linkType: "path", path: "/baerekraft" },
      },
      { _key: "nyheter", label: "Nyheter", link: { label: "Nyheter", linkType: "path", path: "/nyheter" } },
      {
        _key: "om-oss",
        label: "Om oss",
        link: { label: "Om STOK Emballage", linkType: "path", path: "/om-oss" },
        groups: [
          {
            _key: "selskapet",
            title: "Selskapet",
            links: [
              link("om", "Om STOK Emballage", "/om-oss"),
              link("karriere", "Karriere", "/om-oss/karriere"),
              link("apenhetsloven", "Åpenhetsloven", "/om-oss/apenhetsloven"),
            ],
          },
        ],
      },
    ],
    headerCta: { label: "Kontakt oss", linkType: "path", path: "/kontakt" },
    footerGroups: [
      {
        _key: "losninger",
        title: "Løsninger",
        links: [
          link("fisk", "Fisk og sjømat", "/bransjer/fisk-og-sjomat"),
          link("naeringsmiddel", "Næringsmiddel", "/bransjer/naeringsmiddel"),
          link("transport", "Transport og lagring", "/bransjer/transport-og-lagring"),
          link("produkter", "Alle produkter", "/produkter"),
        ],
      },
      {
        _key: "selskapet",
        title: "Selskapet",
        links: [
          link("om", "Om oss", "/om-oss"),
          link("nyheter", "Nyheter", "/nyheter"),
          link("baerekraft", "Bærekraft", "/baerekraft"),
          link("karriere", "Karriere", "/om-oss/karriere"),
        ],
      },
    ],
    legalLinks: [
      link("personvern", "Personvern", "/personvern"),
      link("cookies", "Informasjonskapsler", "/informasjonskapsler"),
      link("apenhetsloven", "Åpenhetsloven", "/om-oss/apenhetsloven"),
    ],
  },
  is: {
    mainMenu: [
      {
        _key: "lausnir",
        label: "Lausnir",
        link: { label: "Allar lausnir", linkType: "path", path: "/lausnir" },
        groups: [
          {
            _key: "atvinnugreinar",
            title: "Atvinnugreinar",
            links: [
              link("fiskur", "Fiskur og sjávarafurðir", "/atvinnugreinar/fiskur-og-sjavarafurdir"),
              link("matvaeli", "Matvæli", "/atvinnugreinar/matvaeli"),
            ],
          },
          {
            _key: "vorur",
            title: "Vörur",
            links: [link("allar-vorur", "Allar vörur", "/vorur")],
          },
        ],
      },
      { _key: "vorur", label: "Vörur", link: { label: "Vörur", linkType: "path", path: "/vorur" } },
      {
        _key: "sjalfbaerni",
        label: "Sjálfbærni",
        link: { label: "Sjálfbærni", linkType: "path", path: "/sjalfbaerni" },
      },
      { _key: "frettir", label: "Fréttir", link: { label: "Fréttir", linkType: "path", path: "/frettir" } },
      {
        _key: "um-okkur",
        label: "Um okkur",
        link: { label: "Um okkur", linkType: "path", path: "/um-okkur" },
      },
    ],
    headerCta: { label: "Hafðu samband", linkType: "path", path: "/hafa-samband" },
    footerGroups: [
      {
        _key: "lausnir",
        title: "Lausnir",
        links: [
          link("fiskur", "Fiskur og sjávarafurðir", "/atvinnugreinar/fiskur-og-sjavarafurdir"),
          link("matvaeli", "Matvæli", "/atvinnugreinar/matvaeli"),
          link("vorur", "Allar vörur", "/vorur"),
        ],
      },
      {
        _key: "fyrirtaekid",
        title: "Fyrirtækið",
        links: [link("um", "Um okkur", "/um-okkur"), link("frettir", "Fréttir", "/frettir")],
      },
    ],
    legalLinks: [
      link("personuvernd", "Persónuvernd", "/personuvernd"),
      link("vafrakokur", "Vafrakökur", "/vafrakokur"),
    ],
  },
};
