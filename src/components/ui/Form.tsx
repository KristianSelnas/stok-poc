import type { ComponentProps } from "react";

/**
 * Felles skjemaelementer. Alle felt har samme kant, fokusmarkering og feilfarge.
 * `className` er ment for plassering og bredde (f.eks. `w-32`, `flex-1`), ikke for å
 * overstyre utseendet. Endrer du utseendet, gjør det her, så følger alle skjemaer med.
 */
const fieldBase =
  "border-2 border-stok-blue/20 bg-white py-2.5 text-stok-text focus:border-stok-blue focus:outline-none aria-invalid:border-red-600";

/**
 * Avrundingen på enlinjes felt. `rounded` passer i vanlige skjemaer med flere felt under
 * hverandre. `pill` passer for frittstående felt ved siden av runde knapper, som filtre,
 * søk og antall.
 */
export type FieldShape = "rounded" | "pill";

const shapes: Record<FieldShape, string> = {
  rounded: "rounded-2xl",
  pill: "rounded-full",
};

type ShapeProps = { shape?: FieldShape };

export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return (
    <label className={`mb-1 block font-meta text-sm font-medium text-stok-blue ${className}`} {...props} />
  );
}

/** Enlinjes tekstfelt, tallfelt, datofelt og søkefelt. */
export function Input({ shape = "rounded", className = "", ...props }: ComponentProps<"input"> & ShapeProps) {
  return <input className={`${fieldBase} ${shapes[shape]} px-4 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${fieldBase} block w-full rounded-2xl px-4 ${className}`} {...props} />;
}

/**
 * Nedtrekksliste med egen pil i stedet for nettleserens, så den får plass innenfor
 * den runde kanten. `className` gjelder omslaget; listen fyller hele omslaget.
 */
export function Select({
  shape = "rounded",
  className = "",
  ...props
}: ComponentProps<"select"> & ShapeProps) {
  return (
    <div className={`relative ${className}`}>
      <select className={`${fieldBase} ${shapes[shape]} w-full appearance-none pr-11 pl-4`} {...props} />
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-stok-blue"
      >
        <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Hjelpetekst under et felt. Koble den til feltet med `aria-describedby`. */
export function FieldHelp({ className = "", ...props }: ComponentProps<"p">) {
  return <p className={`mt-1 text-sm ${className}`} {...props} />;
}

/** Feilmelding under et felt. Koble den til feltet med `aria-describedby`. */
export function FieldError({ className = "", ...props }: ComponentProps<"p">) {
  return <p className={`mt-1 text-sm text-red-700 ${className}`} {...props} />;
}
