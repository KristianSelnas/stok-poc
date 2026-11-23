type SectionHeaderProps = {
  eyebrow?: string | null;
  title?: string | null;
  intro?: string | null;
  align?: "left" | "center";
  /** Lys tekst på mørk bakgrunn. */
  inverted?: boolean;
};

export function Eyebrow({ children, inverted = false }: { children: React.ReactNode; inverted?: boolean }) {
  return (
    <p
      className={`mb-3 font-meta text-sm font-medium tracking-wide uppercase ${
        inverted ? "text-stok-green" : "text-stok-green-dark"
      }`}
    >
      {children}
    </p>
  );
}

/** Stikktittel, overskrift og ingress over en seksjon. */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  inverted = false,
}: SectionHeaderProps) {
  if (!eyebrow && !title && !intro) return null;
  return (
    <div className={`mb-10 max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow inverted={inverted}>{eyebrow}</Eyebrow>}
      {title && <h2 className={`text-3xl md:text-4xl ${inverted ? "text-white" : ""}`}>{title}</h2>}
      {intro && <p className={`mt-4 text-lg ${inverted ? "text-white/85" : ""}`}>{intro}</p>}
    </div>
  );
}
