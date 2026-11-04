import type { ReactNode } from "react";
import s from "./PhotoGrid.module.css";

interface Props {
  images: string[];
  alt: string;
  fallback: ReactNode;
}

const SHOWN = 4; // one large photo + three small ones

function Tile({ src, alt, main }: { src: string; alt: string; main?: boolean }) {
  return (
    <a className={`${s.tile} ${main ? s.main : ""}`} href={src} target="_blank" rel="noreferrer" aria-label={`Open photo: ${alt}`}>
      <img className={s.photo} src={src} alt={alt} loading="lazy" decoding="async" />
    </a>
  );
}

/** Still photo layout, no sliding. Extra photos open in a native <details>. */
export function PhotoGrid({ images, alt, fallback }: Props) {
  if (images.length === 0) return <div className={s.empty}>{fallback}</div>;
  const first = images.slice(0, SHOWN);
  const rest = images.slice(SHOWN);

  return (
    <div className={s.wrap}>
      <div className={s.grid}>
        {first.map((src, n) => (
          <Tile key={src} src={src} main={n === 0} alt={`${alt}, photo ${n + 1} of ${images.length}`} />
        ))}
      </div>
      {rest.length > 0 && (
        <details className={s.more}>
          <summary>View all {images.length} photos</summary>
          <div className={s.grid}>
            {rest.map((src, n) => (
              <Tile key={src} src={src} alt={`${alt}, photo ${SHOWN + n + 1} of ${images.length}`} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}