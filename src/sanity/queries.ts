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
  }
`;

const seoFields = /* groq */ `
  title,
  description,
  "image": image.asset->url,
  noIndex
`;

export const siteSettingsQuery = defineQuery(`
  *[_id == $id][0]{
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
  *[_id == $id][0]{
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
  *[_id == $id][0]{
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
    seo{ ${seoFields} }
  }
`);

export const pageSlugsQuery = defineQuery(`
  *[_type == "page" && language == $language && defined(slug.current)].slug.current
`);
