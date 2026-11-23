import type { FeatureIconName } from "@/lib/featureIcons";

/** Enkle strekikoner i STOK-stil (24 × 24, strek 1,75). */
const paths: Record<FeatureIconName, React.ReactNode> = {
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  advice: (
    <>
      <path d="M4 5h16v10H9l-5 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  warehouse: (
    <>
      <path d="M3 9.5 12 4l9 5.5V20H3V9.5Z" />
      <path d="M7 20v-7h10v7M7 16.5h10" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6L12 3Z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7" />
      <circle cx="6.5" cy="17.5" r="1.75" />
      <circle cx="17" cy="17.5" r="1.75" />
    </>
  ),
  recycle: (
    <>
      <path d="M7.5 10 5 14.5a2 2 0 0 0 1.7 3H10M9.5 6.5l1-1.7a2 2 0 0 1 3.5 0l2.5 4.2" />
      <path d="M14 17.5h3.3a2 2 0 0 0 1.7-3l-1-1.8" />
      <path d="m7 7.5 2.5-1 1 2.5M16.5 6.5l.2 2.7-2.7.3M12 20l-2-2.5 2-2" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" />
      <path d="M5 19c3-4 6-7 10-9" />
    </>
  ),
  fish: (
    <>
      <path d="M3 12c3-4.5 7-6 11-6 3 0 5 2.5 6.5 6-1.5 3.5-3.5 6-6.5 6-4 0-8-1.5-11-6Z" />
      <path d="M3 12 1.5 8.5M3 12l-1.5 3.5" />
      <circle cx="15.5" cy="10.5" r="0.75" fill="currentColor" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-3.5 2.6-5.5 5.5-5.5s5 2 5.5 5.5" />
      <circle cx="17" cy="9" r="2.25" />
      <path d="M16 13.6c2.4.2 4 2 4.5 5.4" />
    </>
  ),
  handshake: (
    <>
      <path d="m2.5 11 4-4 3 1.5 2.5-1.5 3.5 1 4 3.5" />
      <path d="m6.5 13.5 4 4c.7.7 1.8.7 2.5 0l4.5-4.5M9.5 8.5 7 11l1.5 1.5c.8.8 2 .8 2.8 0L13 10.8" />
    </>
  ),
};

export function FeatureIcon({ name, className = "" }: { name: FeatureIconName | null; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name ?? "check"]}
    </svg>
  );
}
