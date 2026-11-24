import { t } from "@/shop/dictionary";
import type { PackagingSpec, SpecChange } from "@/shop/domain";
import { formatDimensions, formatPrint, styleLabels } from "@/shop/specs";

/** Kort oversikt over en skreddersydd spesifikasjon. */
export function SpecSummary({ spec }: { spec: PackagingSpec }) {
  const rows: [string, string][] = [
    ["Type", styleLabels[spec.style] ?? spec.style],
    [t.dimensionsMm, formatDimensions(spec)],
    [t.board, spec.board],
    [t.color, spec.color],
    ["Trykk", formatPrint(spec.print)],
  ];
  if (spec.notes) rows.push([t.specNotes, spec.notes]);
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-stok-text">{label}</dt>
          <dd className="text-stok-blue">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Tabell over endringer mellom original og variant. */
export function ChangesTable({ changes }: { changes: SpecChange[] }) {
  if (!changes.length) return <p className="text-sm">{t.noChanges}</p>;
  return (
    <table className="w-full text-left text-sm">
      <caption className="sr-only">{t.changes}</caption>
      <thead className="text-stok-blue">
        <tr className="border-b-2 border-stok-blue/15">
          <th scope="col" className="py-1.5 pr-3">
            {t.change}
          </th>
          <th scope="col" className="py-1.5 pr-3">
            {t.before}
          </th>
          <th scope="col" className="py-1.5">
            {t.after}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stok-blue/10">
        {changes.map((c) => (
          <tr key={c.field}>
            <th scope="row" className="py-1.5 pr-3 font-semibold text-stok-blue">
              {c.label}
            </th>
            <td className="py-1.5 pr-3 text-stok-text line-through decoration-stok-text/50">{c.from}</td>
            <td className="py-1.5 font-semibold text-stok-green-dark">{c.to}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
