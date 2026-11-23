/**
 * Typer for resultatene av GROQ-spørringene i fase 1.
 * Erstattes av Sanity TypeGen i fase 2.
 */

export type Link = {
  label: string;
  linkType?: "path" | "external";
  path?: string;
  url?: string;
};

export type LinkGroup = {
  _key: string;
  title: string;
  links: (Link & { _key: string })[];
};

export type MenuItem = {
  _key: string;
  label: string;
  link?: Link;
  groups?: LinkGroup[];
};

export type SocialLink = {
  _key: string;
  platform: "linkedin" | "facebook" | "instagram" | "youtube";
  url: string;
};

export type SiteSettings = {
  title: string;
  description?: string;
  companyName?: string;
  orgNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  socialLinks?: SocialLink[];
};

export type Navigation = {
  mainMenu: MenuItem[];
  headerCta?: Link;
  footerGroups?: LinkGroup[];
  legalLinks?: (Link & { _key: string })[];
};
