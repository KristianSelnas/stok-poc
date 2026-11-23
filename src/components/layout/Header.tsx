import { getNavigation, getSiteSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isExternal, resolveHref } from "@/lib/links";
import { marketPath, markets, type MarketId } from "@/lib/markets";
import type { Link as SanityLink } from "@/sanity/types";

import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import type { MarketOption, NavItem, NavLink } from "./nav-types";

function toNavLink(link: SanityLink | undefined, market: MarketId, key: string): NavLink | undefined {
  const href = resolveHref(link, market);
  if (!link || !href) return undefined;
  return { key, label: link.label, href, external: isExternal(link) };
}

export async function Header({ market }: { market: MarketId }) {
  const [navigation, settings] = await Promise.all([getNavigation(market), getSiteSettings(market)]);
  const t = getDictionary(market);

  const items: NavItem[] = navigation.mainMenu.map((item) => ({
    key: item._key,
    label: item.label,
    link: toNavLink(item.link, market, `${item._key}-link`),
    groups: (item.groups ?? []).map((group) => ({
      key: group._key,
      title: group.title,
      links: group.links.flatMap((link) => toNavLink(link, market, link._key) ?? []),
    })),
  }));

  // Markedsvelgeren lenker til forsiden i hvert marked. I fase 3 kan den peke
  // på oversettelsen av gjeldende side når den finnes.
  const marketOptions: MarketOption[] = Object.values(markets).map((m) => ({
    id: m.id,
    label: m.label,
    language: m.language,
    href: marketPath(m.id),
    current: m.id === market,
  }));

  return (
    <header className="relative z-40 bg-white shadow-sm">
      <div className="mx-auto flex h-20 max-w-page items-center gap-4 px-5 md:px-8">
        <Logo href={marketPath(market)} label={`${settings.title} – ${t.home}`} className="w-28 md:w-36" />
        <MainNav
          items={items}
          cta={toNavLink(navigation.headerCta, market, "cta")}
          markets={marketOptions}
          labels={{
            mainNavigation: t.mainNavigation,
            openMenu: t.openMenu,
            closeMenu: t.closeMenu,
            goTo: t.goTo,
            chooseMarket: t.chooseMarket,
          }}
        />
      </div>
    </header>
  );
}
