// Money is integer pence everywhere. Format only at the edge.
export function gbp(pence: number, opts: { showPence?: boolean } = {}): string {
  const pounds = pence / 100;
  const hasFraction = pence % 100 !== 0;
  const showPence = opts.showPence ?? hasFraction;
  return (
    '£' +
    pounds.toLocaleString('en-GB', {
      minimumFractionDigits: showPence ? 2 : 0,
      maximumFractionDigits: showPence ? 2 : 0,
    })
  );
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.min(100, Math.max(0, (part / whole) * 100));
}
