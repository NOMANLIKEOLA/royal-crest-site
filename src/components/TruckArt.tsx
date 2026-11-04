import { tokens, type PaintName } from "@/tokens/tokens";

const fill = (color: string) => ({ fill: color });

/** Flat side-view sleeper tractor, shown when a truck has no photos yet. */
export function TruckArt({ paint, label, className }: { paint: PaintName; label: string; className?: string }) {
  const { ink, chrome, brown } = tokens.colors;
  const body = fill(tokens.paint[paint]);
  return (
    <svg className={className} viewBox="0 0 320 140" role="img" aria-label={label}>
      <rect x="14" y="98" width="296" height="10" rx="5" style={fill(ink)} />
      <rect x="18" y="30" width="132" height="70" rx="10" style={body} />
      <rect x="18" y="68" width="132" height="6" style={fill(brown)} />
      <path d="M150 100V32H196Q210 32 218 46L238 78H296Q306 78 306 88V100Z" style={body} />
      <path d="M202 42H207Q212 42 216 50L228 72H202Z" style={{ ...fill(ink), opacity: 0.85 }} />
      <rect x="158" y="8" width="7" height="40" rx="3" style={fill(chrome)} />
      <rect x="170" y="86" width="44" height="16" rx="8" style={fill(chrome)} />
      {[66, 112, 252].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="108" r="19" style={fill(ink)} />
          <circle cx={cx} cy="108" r="8" style={fill(chrome)} />
        </g>
      ))}
    </svg>
  );
}