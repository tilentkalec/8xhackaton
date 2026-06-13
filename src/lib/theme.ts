// Pots design tokens — dark, high-contrast, "expensive" fintech.
// Deep background, ONE bold accent, big numerals, generous spacing.
export const C = {
  bg: '#0B0B0F',
  bgElevated: '#15151C',
  card: '#191921',
  cardHi: '#20202A',
  border: '#26262F',
  accent: '#C8FF4D', // acid lime — money + Gen-Z energy
  accentDim: '#2C3514',
  text: '#F5F5F7',
  textMuted: '#9A9AA6',
  textFaint: '#5E5E6B',
  good: '#4ADE80',
  warn: '#FBBF24',
  danger: '#FB5E5E',
  dangerDim: '#3A1717',
} as const;

export const S = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  radius: 20,
  radiusSm: 12,
} as const;

export const F = {
  // big numerals are the brand; use tabular weights
  hero: { fontSize: 52, fontWeight: '800' as const, letterSpacing: -1.5 },
  big: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -1 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.4 },
  body: { fontSize: 16, fontWeight: '500' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
  caption: { fontSize: 12, fontWeight: '500' as const },
} as const;
