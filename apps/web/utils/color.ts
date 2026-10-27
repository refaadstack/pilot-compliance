function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const INK = '#0E2740';
const WHITE = '#FFFFFF';

/** Picks ink or white, whichever has the higher WCAG contrast against the given background. */
export function readableTextColor(background: string): string {
  const bg = luminance(background);
  return contrast(bg, luminance(INK)) >= contrast(bg, luminance(WHITE)) ? INK : WHITE;
}
