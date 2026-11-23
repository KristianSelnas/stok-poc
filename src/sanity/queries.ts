import { defineQuery } from "next-sanity";

/*
 * GROQ-spørringer. Typene genereres av Sanity TypeGen til `sanity.types.ts`
 * (kjør `pnpm typegen`). Fragmentene settes inn med template literals, som
 * TypeGen løser opp.
 */

const linkFields = /* groq */ `
  label,
  linkType,
  path,
  url,
  "internal": internal->{ _type, "slug": slug.current }
`;

const imageFields = /* groq */ `
  "url": asset->url,
  alt,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  hotspot
`;

const blockFields = /* groq */ `
  ...,
  _type == "block" => {
    ...,
    markDefs[]{
      ...,
      _type == "linkAnnotation" => { _key, _type, ${linkFields} }
    }
  },
  _type == "imageWithAlt" => { _key, _type, ${imageFields} }
`;

const productCardFields = /* groq */ `
  _id,
  _type,
  title,
  "slug": slug.current,
  shortDescription,
  "image": images[0]{ ${imageFields} },
  "group": productGroup->title
`;

const newsCardFields = /* groq */ `
  _id,
  _type,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  image{ ${imageFields} },
  "category": category->title
`;

const personFields = /* groq */ `
  _id,
  name,
  role,
  phone,
  email,
  area,
  image{ ${imageFields} },
  "departmentId": department._ref
`;

const locationFields = /* groq */ `
  _id,
  title,
  street,
  postalCode,
  city,
  phone,
  email,
  openingHours
`;

/*
 * Moduler. Moduler som viser andre dokumenter (produkter, nyheter, personer)
 * henter dem her, så komponentene ikke trenger egne spørringer.
 * Krever parameteren $language.
 */
const modulesFields = /* groq */ `
  _key,
  _type,
  _type == "hero" => {
    eyebrow,
    title,
    lead,
    image{ ${imageFields} },
    ctas[]{ _key, ${linkFields} }
  },
  _type == "richText" => {
    content[]{ ${blockFields} }
  },
  _type == "textWithImage" => {
    eyebrow,
    title,
    body[]{ ${blockFields} },
    image{ ${imageFields} },
    imagePosition,
    cta{ ${linkFields} }
  },
  _type == "cardGrid" => {
    eyebrow,
    title,
    intro,
    columns,
    cards[]{ _key, title, text, image{ ${imageFields} }, link{ ${linkFields} } }
  },
  _type == "featureList" => {
    eyebrow,
    title,
    intro,
    items[]{ _key, icon, title, text }
  },
  _type == "ctaBanner" => {
    title,
    text,
    tone,
    cta{ ${linkFields} },
    image{ ${imageFields} }
  },
  _type == "productGrid" => {
    eyebrow,
    title,
    intro,
    limit,
    cta{ ${linkFields} },
    "products": select(
      source == "group" => *[_type == "product" && language == $language && productGroup._ref == ^.productGroup._ref] | order(title asc){ ${productCardFields} },
      source == "industry" => *[_type == "product" && language == $language && ^.industry._ref in industries[]._ref] | order(title asc){ ${productCardFields} },
      products[]->{ ${productCardFields} }
    )
  },
  _type == "productCatalog" => {
    title,
    intro
  },
  _type == "newsList" => {
    eyebrow,
    title,
    limit,
    cta{ ${linkFields} },
    "articles": *[_type == "newsArticle" && language == $language && (!defined(^.category) || category._ref == ^.category._ref)] | order(publishedAt desc){ ${newsCardFields} }
  },
  _type == "contactPeople" => {
    eyebrow,
    title,
    intro,
    showCustomerService,
    "selectedPeople": people[]->{ ${personFields} },
    "departments": select(
      count(departments) > 0 => departments[]->{ _id, title },
      *[_type == "department" && language == $language] | order(order asc){ _id, title }
    ),
    "people": *[_type == "person" && language == $language] | order(order asc, name asc){ ${personFields} }
  },
  _type == "locations" => {
    eyebrow,
    title,
    "items": select(
      count(items) > 0 => items[]->{ ${locationFields} },
      *[_type == "location" && language == $language] | order(title asc){ ${locationFields} }
    )
  },
  _type == "testimonials" => {
    eyebrow,
    title,
    "items": items[]->{ _id, quote, name, role, company, logo{ ${imageFields} } }
  },
  _type == "logoRow" => {
    eyebrow,
    title,
    intro,
    "certificates": certificates[]->{ _id, title, description, url, "fileUrl": file.asset->url, logo{ ${imageFields} } }
  }
`;

/**
 * Oversettelser av dokumentet, koblet med `@sanity/document-internationalization`.
 * Brukes til `hreflang` i metadata og sitemap.
 */
const translationsField = /* groq */ `
  "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
    "language": coalesce(language, _key),
    "type": value->_type,
    "slug": value->slug.current
  }
`;

const seoFields = /* groq */ `
  title,
  description,
  "image": image.asset->url,
  noIndex
`;

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings" && _id == $id][0]{
    title,
    description,
    companyName,
    orgNumber,
    address,
    phone,
    email,
    socialLinks[]{ _key, platform, url }
  }
`);

export const navigationQuery = defineQuery(`
  *[_type == "navigation" && _id == $id][0]{
    mainMenu[]{
      _key,
      label,
      link{ ${linkFields} },
      groups[]{ _key, title, links[]{ _key, ${linkFields} } }
    },
    headerCta{ ${linkFields} },
    footerGroups[]{ _key, title, links[]{ _key, ${linkFields} } },
    legalLinks[]{ _key, ${linkFields} }
  }
`);

export const frontPageQuery = defineQuery(`
  *[_type == "frontPage" && _id == $id && language == $language][0]{
    modules[]{ ${modulesFields} },
    seo{ ${seoFields} }
  }
`);

export const pageQuery = defineQuery(`
  *[_type == "page" && language == $language && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    modules[]{ ${modulesFields} },
    ${translationsField},
    seo{ ${seoFields} }
  }
`);

export const industryQuery = defineQuery(`
  *[_type == "industry" && language == $language && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    heroTitle,
    lead,
    image{ ${imageFields} },
    modules[]{ ${modulesFields} },
    "featuredProducts": featuredProducts[]->{ ${productCardFields} },
    "industryProducts": *[_type == "product" && language == $language && references(^._id)] | order(title asc){ ${productCardFields} },
    ${translationsField},
    seo{ ${seoFields} }
  }
`);

export const productQuery = defineQuery(`
  *[_type == "product" && language == $language && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    "images": images[]{ _key, ${imageFields} },
    description[]{ ${blockFields} },
    properties[]{ _key, key, value },
    "datasheetUrl": datasheet.asset->url,
    "group": productGroup->{ title, "slug": slug.current },
    "industries": industries[]->{ _id, title, "slug": slug.current },
    "materials": materials[]->{ _id, title },
    "relatedProducts": relatedProducts[]->{ ${productCardFields} },
    "sameGroup": *[_type == "product" && language == $language && defined(^.productGroup) && productGroup._ref == ^.productGroup._ref && _id != ^._id] | order(title asc)[0...4]{ ${productCardFields} },
    ${translationsField},
    seo{ ${seoFields} }
  }
`);

export const newsArticleQuery = defineQuery(`
  *[_type == "newsArticle" && language == $language && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    image{ ${imageFields} },
    "category": category->title,
    body[]{ ${blockFields} },
    "moreNews": *[_type == "newsArticle" && language == $language && _id != ^._id] | order(publishedAt desc)[0...3]{ ${newsCardFields} },
    ${translationsField},
    seo{ ${seoFields} }
  }
`);

/** Alt katalogen trenger: produkter med filterverdier og listene over filtervalg. */
export const catalogQuery = defineQuery(`
  {
    "products": *[_type == "product" && language == $language] | order(title asc){
      ${productCardFields},
      "groupSlug": productGroup->slug.current,
      "industrySlugs": industries[]->slug.current,
      "materialSlugs": materials[]->slug.current
    },
    "groups": *[_type == "productGroup" && language == $language] | order(order asc, title asc){ title, "slug": slug.current },
    "industries": *[_type == "industry" && language == $language] | order(title asc){ title, "slug": slug.current },
    "materials": *[_type == "material" && language == $language] | order(title asc){ title, "slug": slug.current }
  }
`);

/** Alle adresser i et marked, til generateStaticParams. */
export const routesQuery = defineQuery(`
  *[_type in ["page", "industry", "product", "newsArticle"] && language == $language && defined(slug.current)]{
    _type,
    "slug": slug.current
  }
`);

/**
 * Alle indekserbare adresser i begge markeder, til sitemap.xml. Dokumenter med
 * «Skjul for søkemotorer» (`seo.noIndex`) er utelatt.
 */
export const sitemapQuery = defineQuery(`
  {
    "frontPages": *[_type == "frontPage" && defined(language) && seo.noIndex != true]{
      language,
      _updatedAt
    },
    "documents": *[_type in ["page", "industry", "product", "newsArticle"] && defined(language) && defined(slug.current) && seo.noIndex != true]{
      _type,
      language,
      _updatedAt,
      "slug": slug.current,
      ${translationsField}
    }
  }
`);
