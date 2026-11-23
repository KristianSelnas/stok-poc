"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import type { MarketOption, NavItem, NavLink } from "./nav-types";

type Labels = {
  mainNavigation: string;
  openMenu: string;
  closeMenu: string;
  goTo: string;
  chooseMarket: string;
};

type MainNavProps = {
  items: NavItem[];
  cta?: NavLink;
  markets: MarketOption[];
  labels: Labels;
};

const MARKET_KEY = "market";

function SmartLink({
  link,
  className,
  onClick,
}: {
  link: NavLink;
  className?: string;
  onClick?: () => void;
}) {
  if (link.external) {
    return (
      <a href={link.href} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className} onClick={onClick}>
      {link.label}
    </Link>
  );
}

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.75 5.7 3.75 9S14.5 18.3 12 21c-2.5-2.7-3.75-5.7-3.75-9S9.5 5.7 12 3Z" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 8"
      className={`h-2 w-3 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 1.5 6 6.5l5-5" />
    </svg>
  );
}

/**
 * Hovedmeny med mega-meny på desktop og utfellbar meny på mobil.
 * Følger «disclosure»-mønsteret: knapper med aria-expanded styrer panelene.
 */
export function MainNav({ items, cta, markets, labels }: MainNavProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const idPrefix = useId();

  // Lukk menyene ved navigasjon.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenKey(null);
    setMobileOpen(false);
  }

  // Lukk mega-menyen ved Escape eller klikk utenfor.
  useEffect(() => {
    if (!openKey && !mobileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const key = openKey;
      setOpenKey(null);
      setMobileOpen(false);
      if (key) document.getElementById(`${idPrefix}-trigger-${key}`)?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenKey(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openKey, mobileOpen, idPrefix]);

  const close = () => {
    setOpenKey(null);
    setMobileOpen(false);
  };

  const currentMarket = markets.find((m) => m.current);
  const marketOpen = openKey === MARKET_KEY;

  return (
    <nav ref={navRef} aria-label={labels.mainNavigation} className="flex flex-1 items-center justify-end">
      {/* Desktop */}
      <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
        {items.map((item) => {
          const isOpen = openKey === item.key;
          if (!item.groups.length && item.link) {
            return (
              <li key={item.key}>
                <SmartLink
                  link={{ ...item.link, label: item.label }}
                  className="block rounded-full px-3 py-2 font-semibold whitespace-nowrap text-stok-blue hover:bg-stok-light xl:px-4"
                />
              </li>
            );
          }
          const panelId = `${idPrefix}-panel-${item.key}`;
          return (
            <li key={item.key}>
              <button
                id={`${idPrefix}-trigger-${item.key}`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenKey(isOpen ? null : item.key)}
                className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold whitespace-nowrap text-stok-blue hover:bg-stok-light xl:px-4 ${
                  isOpen ? "bg-stok-light" : ""
                }`}
              >
                {item.label}
                <Chevron open={isOpen} />
              </button>
              <div
                id={panelId}
                hidden={!isOpen}
                className="absolute inset-x-0 top-full border-t border-stok-light bg-white shadow-xl"
              >
                <div className="mx-auto grid max-w-page gap-10 px-8 py-10 md:grid-cols-[1fr_3fr]">
                  <div>
                    <p className="font-heading text-2xl font-bold text-stok-blue">{item.label}</p>
                    {item.link && (
                      <SmartLink
                        link={{ ...item.link, label: `${labels.goTo} ${item.link.label.toLowerCase()} →` }}
                        className="mt-4 inline-block font-meta text-sm font-medium text-stok-blue underline decoration-stok-green decoration-2 underline-offset-4 hover:decoration-stok-blue"
                        onClick={close}
                      />
                    )}
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {item.groups.map((group) => (
                      <div key={group.key}>
                        <p className="mb-3 font-meta text-sm font-medium tracking-wide text-stok-green-dark uppercase">
                          {group.title}
                        </p>
                        <ul className="space-y-2">
                          {group.links.map((link) => (
                            <li key={link.key}>
                              <SmartLink
                                link={link}
                                className="text-stok-blue hover:text-stok-green-dark hover:underline"
                                onClick={close}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Markedsvelger (desktop) */}
      <div className="relative ml-1 hidden lg:block xl:ml-2">
        <button
          id={`${idPrefix}-trigger-${MARKET_KEY}`}
          type="button"
          aria-expanded={marketOpen}
          aria-controls={`${idPrefix}-panel-${MARKET_KEY}`}
          onClick={() => setOpenKey(marketOpen ? null : MARKET_KEY)}
          className={`flex items-center gap-2 rounded-full px-3 py-2 font-semibold whitespace-nowrap text-stok-blue hover:bg-stok-light xl:px-4 ${
            marketOpen ? "bg-stok-light" : ""
          }`}
        >
          <GlobeIcon />
          <span className="sr-only">{labels.chooseMarket}: </span>
          {currentMarket?.label}
          <Chevron open={marketOpen} />
        </button>
        <ul
          id={`${idPrefix}-panel-${MARKET_KEY}`}
          hidden={!marketOpen}
          aria-label={labels.chooseMarket}
          className="absolute right-0 mt-2 min-w-44 overflow-hidden rounded-2xl border border-stok-light bg-white py-2 shadow-xl"
        >
          {markets.map((m) => (
            <li key={m.id}>
              <Link
                href={m.href}
                hrefLang={m.language}
                lang={m.language}
                aria-current={m.current ? "true" : undefined}
                onClick={close}
                className={`flex items-center justify-between gap-4 px-5 py-2.5 text-stok-blue hover:bg-stok-light ${
                  m.current ? "font-semibold" : ""
                }`}
              >
                {m.label}
                {m.current && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="h-4 w-4 text-stok-green-dark"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="m4 10.5 4 4 8-9" />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {cta && (
        <SmartLink
          link={cta}
          className="ml-2 hidden rounded-full bg-stok-green px-5 py-2.5 font-meta font-medium whitespace-nowrap text-stok-blue transition-colors hover:bg-stok-blue hover:text-white lg:inline-flex xl:ml-4 xl:px-6"
        />
      )}

      {/* Mobil */}
      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls={`${idPrefix}-mobile`}
        onClick={() => setMobileOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full px-3 py-2 font-semibold text-stok-blue hover:bg-stok-light lg:hidden"
      >
        <span>{mobileOpen ? labels.closeMenu : labels.openMenu}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {mobileOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div
        id={`${idPrefix}-mobile`}
        hidden={!mobileOpen}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-stok-light bg-white shadow-xl lg:hidden"
      >
        <ul className="divide-y divide-stok-light px-5 py-2">
          {items.map((item) => (
            <li key={item.key} className="py-1">
              {item.groups.length ? (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-lg font-semibold text-stok-blue">
                    {item.label}
                    <span className="transition-transform group-open:rotate-180">
                      <Chevron open={false} />
                    </span>
                  </summary>
                  <div className="space-y-5 pb-4 pl-3">
                    {item.link && (
                      <SmartLink
                        link={{ ...item.link, label: `${labels.goTo} ${item.link.label.toLowerCase()}` }}
                        className="block font-medium text-stok-blue underline decoration-stok-green decoration-2 underline-offset-4"
                        onClick={close}
                      />
                    )}
                    {item.groups.map((group) => (
                      <div key={group.key}>
                        <p className="mb-2 font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase">
                          {group.title}
                        </p>
                        <ul className="space-y-2">
                          {group.links.map((link) => (
                            <li key={link.key}>
                              <SmartLink link={link} className="text-stok-blue" onClick={close} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              ) : item.link ? (
                <SmartLink
                  link={{ ...item.link, label: item.label }}
                  className="block py-3 text-lg font-semibold text-stok-blue"
                  onClick={close}
                />
              ) : null}
            </li>
          ))}
        </ul>
        <div className="border-t border-stok-light px-5 py-4">
          <p className="mb-2 flex items-center gap-2 font-meta text-xs font-medium tracking-wide text-stok-green-dark uppercase">
            <GlobeIcon />
            {labels.chooseMarket}
          </p>
          <ul className="flex gap-2">
            {markets.map((m) => (
              <li key={m.id}>
                <Link
                  href={m.href}
                  hrefLang={m.language}
                  lang={m.language}
                  aria-current={m.current ? "true" : undefined}
                  onClick={close}
                  className={`block rounded-full border-2 px-4 py-1.5 ${
                    m.current
                      ? "border-stok-blue bg-stok-blue text-white"
                      : "border-stok-light text-stok-blue hover:border-stok-blue"
                  }`}
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {cta && (
          <div className="px-5 pb-6">
            <SmartLink
              link={cta}
              className="flex w-full justify-center rounded-full bg-stok-green px-6 py-3 font-meta font-medium text-stok-blue"
              onClick={close}
            />
          </div>
        )}
      </div>
    </nav>
  );
}
