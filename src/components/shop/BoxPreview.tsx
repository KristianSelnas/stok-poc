import { dieline, type Point } from "@/shop/dieline";
import { t } from "@/shop/dictionary";
import type { PackagingSpec } from "@/shop/domain";
import { formatDimensions, styleShortLabels } from "@/shop/specs";

const nb = new Intl.NumberFormat("nb-NO");

/** Fyll for front, topp og side, slik at kassen ser ut som den er belyst ovenfra. */
const palette: Record<string, { front: string; top: string; side: string; ink: string }> = {
  Brun: { front: "#c99a64", top: "#dcb586", side: "#a97a47", ink: "#123a6b" },
  Hvit: { front: "#f3f0e8", top: "#ffffff", side: "#d9d4c7", ink: "#123a6b" },
  Sort: { front: "#3b3b3b", top: "#555555", side: "#262626", ink: "#ffffff" },
};

/** Farger på trykkfeltet, én stripe per trykkfarge. */
const printColors = ["#123a6b", "#7dc242", "#d9412b", "#f2b600"];

const LINE = "#123a6b";
const path = (points: Point[]) => points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

type Props = { spec: PackagingSpec; view: "3d" | "flat" };

/**
 * Forenklet tegning av en skreddersydd eske, enten som kasse i skråprojeksjon
 * eller som utbrettet stansemønster. Målene er i mm og tegningen skaleres med viewBox.
 */
export function BoxPreview({ spec, view }: Props) {
  return view === "flat" ? <FlatView spec={spec} /> : <BoxView spec={spec} />;
}

function BoxView({ spec }: { spec: PackagingSpec }) {
  const { length: l, width: w, height: h } = spec.innerDimensionsMm;
  const colors = palette[spec.color] ?? palette.Brun;
  // Skråprojeksjon: dybden tegnes i 30 grader og halv lengde.
  const dx = w * 0.5 * Math.cos(Math.PI / 6);
  const dy = w * 0.5 * Math.sin(Math.PI / 6);
  const size = Math.max(l + dx, h + dy);
  const font = size / 18;
  const pad = font * 3;

  // Fronten har øvre venstre hjørne i (0, dy).
  const front: Point[] = [
    [0, dy],
    [l, dy],
    [l, dy + h],
    [0, dy + h],
  ];
  const top: Point[] = [
    [0, dy],
    [dx, 0],
    [l + dx, 0],
    [l, dy],
  ];
  const side: Point[] = [
    [l, dy],
    [l + dx, 0],
    [l + dx, h],
    [l, dy + h],
  ];

  const print = spec.print && spec.print.colors > 0 ? spec.print : null;
  const logoW = l * 0.44;
  const logoH = Math.min(h * 0.36, logoW * 0.5);
  const logoX = (l - logoW) / 2;
  const logoY = dy + (h - logoH) / 2;
  const stripe = logoH / 6;

  const label = t.previewLabel(styleShortLabels[spec.style] ?? spec.style, formatDimensions(spec));

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`${-pad} ${-pad} ${l + dx + 2 * pad + font * 2} ${h + dy + 2 * pad}`}
      className="h-auto max-h-96 w-full"
    >
      <g stroke={LINE} strokeWidth={size / 250} strokeLinejoin="round">
        <path d={`${path(front)} Z`} fill={colors.front} />
        <path d={`${path(top)} Z`} fill={colors.top} />
        <path d={`${path(side)} Z`} fill={colors.side} />
        {spec.style === "0427" ? (
          // Lokket med innstikk dekker toppen av fronten.
          <path
            d={path([
              [0, dy + Math.min(h * 0.18, 25)],
              [l, dy + Math.min(h * 0.18, 25)],
            ])}
          />
        ) : (
          // Skjøten mellom klaffene på toppen.
          <path
            d={path([
              [dx / 2, dy / 2],
              [l + dx / 2, dy / 2],
            ])}
          />
        )}
      </g>

      {print && (
        <g>
          <rect x={logoX} y={logoY} width={logoW} height={logoH} rx={logoH / 8} fill={colors.top} />
          {Array.from({ length: print.colors }, (_, i) => (
            <rect
              key={i}
              x={logoX + logoW * 0.1}
              y={logoY + logoH * 0.62 + (i - print.colors / 2) * stripe * 0.9}
              width={logoW * 0.8 * (1 - i * 0.15)}
              height={stripe * 0.6}
              fill={printColors[i]}
            />
          ))}
          <text
            x={l / 2}
            y={logoY + logoH * 0.36}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={Math.min(font, logoH * 0.3)}
            fontWeight={700}
            fill={printColors[0]}
          >
            LOGO
          </text>
        </g>
      )}

      <g fontSize={font} fill={LINE} className="font-meta">
        <text x={l / 2} y={dy + h + font * 1.6} textAnchor="middle">
          {t.length} {nb.format(l)}
        </text>
        <text
          x={-font * 0.8}
          y={dy + h / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${-font * 0.8} ${dy + h / 2})`}
        >
          {t.height} {nb.format(h)}
        </text>
        <text
          x={l + dx / 2 + font * 0.6}
          y={dy / 2 + h + font * 0.9}
          textAnchor="start"
          transform={`rotate(-30 ${l + dx / 2 + font * 0.6} ${dy / 2 + h + font * 0.9})`}
        >
          {t.width} {nb.format(w)}
        </text>
      </g>
    </svg>
  );
}

function FlatView({ spec }: { spec: PackagingSpec }) {
  const d = dieline(spec);
  const colors = palette[spec.color] ?? palette.Brun;
  const size = Math.max(d.width, d.height);
  const font = size / 40;
  const pad = font * 2;
  const stroke = size / 400;
  const label = t.flatPreviewLabel(styleShortLabels[spec.style] ?? spec.style, formatDimensions(spec));

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`${-pad} ${-pad} ${d.width + 2 * pad} ${d.height + 2 * pad}`}
      className="h-auto max-h-96 w-full"
    >
      {/* Omrisset lukkes automatisk ved fyll, så pappen får farge uten at panelene tegnes for seg. */}
      <path d={d.cuts.map((c) => path(c)).join(" ")} fill={colors.front} />
      <g fill="none" strokeLinecap="round">
        {d.creases.map((c, i) => (
          <path
            key={i}
            d={path(c)}
            stroke="#d9412b"
            strokeWidth={stroke}
            strokeDasharray={`${stroke * 4} ${stroke * 3}`}
          />
        ))}
        {d.cuts.map((c, i) => (
          <path key={i} d={path(c)} stroke={LINE} strokeWidth={stroke * 1.4} strokeLinejoin="round" />
        ))}
      </g>
      <g
        fontSize={font}
        fill={colors.ink}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-meta"
      >
        {d.panels
          .filter((p) => p.label && p.width > font * p.label.length * 0.55 && p.height > font * 1.4)
          .map((p, i) => (
            <text key={i} x={p.x + p.width / 2} y={p.y + p.height / 2}>
              {p.label}
            </text>
          ))}
      </g>
    </svg>
  );
}
