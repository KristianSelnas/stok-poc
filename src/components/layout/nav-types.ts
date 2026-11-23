/** Menydata med ferdige href-er, klar til å sendes til klientkomponenter. */
export type NavLink = {
  key: string;
  label: string;
  href: string;
  external: boolean;
};

export type NavGroup = {
  key: string;
  title: string;
  links: NavLink[];
};

export type NavItem = {
  key: string;
  label: string;
  link?: NavLink;
  groups: NavGroup[];
};

export type MarketOption = {
  id: string;
  label: string;
  language: string;
  href: string;
  current: boolean;
};
