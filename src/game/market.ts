import { STOCKS, CRYPTOS, StockTemplate, CryptoTemplate } from '../content/stocks';

function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rnd: () => number): number {
  const u = 1 - rnd();
  const v = 1 - rnd();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function pricePath(template: { basePrice: number; volatility: number; drift: number }, key: string, atMs: number, steps = 24): number[] {
  const dayMs = 86_400_000;
  const day = Math.floor(atMs / dayMs);
  const rnd = mulberry32(hash32(`${key}-${day}`));
  const out: number[] = [];
  let price = template.basePrice * (1 + template.drift * (day - 19000));
  for (let i = 0; i < steps; i++) {
    const r = template.drift / 24 + template.volatility / Math.sqrt(24) * gauss(rnd);
    price = price * (1 + r);
    if (price < template.basePrice * 0.05) price = template.basePrice * 0.05;
    out.push(price);
  }
  return out;
}

export interface StockSnapshot {
  ticker: string;
  template: StockTemplate;
  price: number;
  changePct: number;
  series: number[];
}

export function getStockSnapshot(ticker: string, atMs: number = Date.now()): StockSnapshot | null {
  const t = STOCKS.find((s) => s.ticker === ticker);
  if (!t) return null;
  const series = pricePath(t, t.ticker, atMs);
  const hourIdx = new Date(atMs).getHours();
  const price = series[hourIdx];
  const open = series[0];
  return { ticker, template: t, price, changePct: ((price - open) / open) * 100, series };
}

export function getAllStocks(atMs: number = Date.now()): StockSnapshot[] {
  return STOCKS.map((s) => getStockSnapshot(s.ticker, atMs)!).filter(Boolean);
}

export interface CryptoSnapshot {
  symbol: string;
  template: CryptoTemplate;
  price: number;
  changePct: number;
  series: number[];
}

export function getCryptoSnapshot(symbol: string, atMs: number = Date.now()): CryptoSnapshot | null {
  const t = CRYPTOS.find((c) => c.symbol === symbol);
  if (!t) return null;
  const series = pricePath(t, t.symbol, atMs);
  const hourIdx = new Date(atMs).getHours();
  const price = series[hourIdx];
  const open = series[0];
  return { symbol, template: t, price, changePct: ((price - open) / open) * 100, series };
}

export function getAllCryptos(atMs: number = Date.now()): CryptoSnapshot[] {
  return CRYPTOS.map((c) => getCryptoSnapshot(c.symbol, atMs)!).filter(Boolean);
}
