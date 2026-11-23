import { applyCacheLife, getNavigation, getSiteSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { marketPath, type MarketId } from "@/lib/markets";

import { CmsLink } from "../ui/CmsLink";
import { Logo } from "./Logo";

const socialLabels = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
} as const;

const footerLinkClass = "hover:text-stok-green hover:underline";

export async function Footer({ market }: { market: MarketId }) {
  "use cache";
  // Komponenten caches for å kunne bruke dagens dato. Levetiden må følge innholdet.
  applyCacheLife();
  const [navigation, settings] = await Promise.all([getNavigation(market), getSiteSettings(market)]);
  const t = getDictionary(market);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-stok-blue text-white">
      <div className="mx-auto grid max-w-page gap-10 px-5 py-14 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo href={marketPath(market)} label={`${settings.title} – ${t.home}`} inverted className="w-32" />
          {settings.description && <p className="max-w-xs text-sm text-white/80">{settings.description}</p>}
        </div>

        <div>
          <h2 className="mb-4 font-meta text-sm font-medium tracking-wide text-stok-green uppercase">
            {t.footerContact}
          </h2>
          <address className="space-y-1 not-italic">
            {settings.companyName && <p className="font-semibold">{settings.companyName}</p>}
            {settings.address && <p className="whitespace-pre-line">{settings.address}</p>}
            {settings.phone && (
              <p>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="hover:text-stok-green hover:underline"
                >
                  {settings.phone}
                </a>
              </p>
            )}
            {settings.email && (
              <p>
                <a href={`mailto:${settings.email}`} className="hover:text-stok-green hover:underline">
                  {settings.email}
                </a>
              </p>
            )}
            {settings.orgNumber && (
              <p className="text-sm text-white/70">
                {t.orgNumber} {settings.orgNumber}
              </p>
            )}
          </address>
          {!!settings.socialLinks?.length && (
            <ul className="mt-4 flex gap-4" aria-label={t.footerFollow}>
              {settings.socialLinks.map((social) => (
                <li key={social._key}>
                  <a
                    href={social.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stok-green"
                  >
                    {social.platform ? socialLabels[social.platform] : social.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {navigation.footerGroups?.map((group) => (
          <div key={group._key}>
            <h2 className="mb-4 font-meta text-sm font-medium tracking-wide text-stok-green uppercase">
              {group.title}
            </h2>
            <ul className="space-y-2">
              {(group.links ?? []).map((link) => (
                <li key={link._key}>
                  <CmsLink link={link} market={market} className={footerLinkClass} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-page flex-col gap-4 px-5 py-6 text-sm text-white/80 md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {year} {settings.companyName ?? settings.title}
          </p>
          {!!navigation.legalLinks?.length && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {navigation.legalLinks.map((link) => (
                <li key={link._key}>
                  <CmsLink link={link} market={market} className={footerLinkClass} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
