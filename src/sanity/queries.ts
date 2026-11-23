import { defineQuery } from "next-sanity";

const linkProjection = /* groq */ `{ label, linkType, path, url }`;

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
      link${linkProjection},
      groups[]{ _key, title, links[]{ _key, ...${linkProjection} } }
    },
    headerCta${linkProjection},
    footerGroups[]{ _key, title, links[]{ _key, ...${linkProjection} } },
    legalLinks[]{ _key, ...${linkProjection} }
  }
`);
