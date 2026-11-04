/** Design tokens used by the SVG truck illustration. Values live in styles/tokens.css. */
export const tokens = {
  colors: {
    ink: "var(--color-ink)",
    chrome: "var(--color-chrome)",
    brand: "var(--color-brand)",
    brown: "var(--color-brown)",
  },
  paint: {
    white: "var(--paint-white)",
    black: "var(--paint-black)",
    brown: "var(--paint-brown)",
    blue: "var(--paint-blue)",
    silver: "var(--paint-silver)",
  },
} as const;

export type PaintName = keyof typeof tokens.paint;
export const PAINT_NAMES = Object.keys(tokens.paint) as PaintName[];