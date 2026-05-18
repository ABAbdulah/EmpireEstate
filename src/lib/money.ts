import Decimal from 'decimal.js';

Decimal.set({ precision: 40, rounding: Decimal.ROUND_DOWN, toExpNeg: -40, toExpPos: 40 });

export type Money = Decimal;

export const M = (value: Decimal.Value): Money => new Decimal(value);
export const ZERO = M(0);

const SUFFIXES: { value: Decimal; symbol: string }[] = [
  { value: new Decimal('1e36'), symbol: 'Ud' },
  { value: new Decimal('1e33'), symbol: 'Dc' },
  { value: new Decimal('1e30'), symbol: 'No' },
  { value: new Decimal('1e27'), symbol: 'Oc' },
  { value: new Decimal('1e24'), symbol: 'Sp' },
  { value: new Decimal('1e21'), symbol: 'Sx' },
  { value: new Decimal('1e18'), symbol: 'Qi' },
  { value: new Decimal('1e15'), symbol: 'Qa' },
  { value: new Decimal('1e12'), symbol: 'T' },
  { value: new Decimal('1e9'), symbol: 'B' },
  { value: new Decimal('1e6'), symbol: 'M' },
  { value: new Decimal('1e3'), symbol: 'k' },
];

export function formatMoney(value: Decimal.Value, opts?: { prefix?: string; decimals?: 'auto' | number }): string {
  const v = value instanceof Decimal ? value : new Decimal(value);
  const prefix = opts?.prefix ?? '$';
  const neg = v.isNegative();
  const abs = v.abs();

  if (abs.lt(1000)) {
    const dp = opts?.decimals === 'auto' || opts?.decimals === undefined ? 2 : opts.decimals;
    const s = abs.toFixed(dp);
    const [int, frac] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${neg ? '-' : ''}${prefix}${grouped}${frac ? '.' + frac : ''}`;
  }

  if (abs.lt(1_000_000)) {
    const s = abs.toFixed(2);
    const [int, frac] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${neg ? '-' : ''}${prefix}${grouped}${frac ? '.' + frac : ''}`;
  }

  for (const { value: threshold, symbol } of SUFFIXES) {
    if (abs.gte(threshold)) {
      const scaled = abs.div(threshold);
      const dp = scaled.lt(10) ? 2 : scaled.lt(100) ? 1 : 0;
      return `${neg ? '-' : ''}${prefix}${scaled.toFixed(dp)}${symbol}`;
    }
  }

  return `${neg ? '-' : ''}${prefix}${abs.toFixed(0)}`;
}

export function formatPercent(value: Decimal.Value, decimals = 2): string {
  const v = value instanceof Decimal ? value : new Decimal(value);
  const sign = v.gt(0) ? '+' : '';
  return `${sign}${v.toFixed(decimals)}%`;
}

export function formatInteger(value: Decimal.Value): string {
  const v = value instanceof Decimal ? value : new Decimal(value);
  return v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
