import Decimal from 'decimal.js';
import { M, Money, ZERO } from '../lib/money';
import { BusinessTemplate, BUSINESSES } from '../content/businesses';

const COST_GROWTH = new Decimal('1.07');
const INCOME_GROWTH = new Decimal('1.10');

export function businessTemplate(id: string): BusinessTemplate {
  const t = BUSINESSES.find((b) => b.id === id);
  if (!t) throw new Error(`Unknown business id: ${id}`);
  return t;
}

export function upgradeCost(template: BusinessTemplate, currentLevel: number, quantity = 1): Money {
  const base = M(template.baseCost);
  if (quantity === 1) {
    return base.times(COST_GROWTH.pow(currentLevel)).ceil();
  }
  let total = ZERO;
  for (let i = 0; i < quantity; i++) {
    total = total.plus(base.times(COST_GROWTH.pow(currentLevel + i)));
  }
  return total.ceil();
}

export function maxAffordableUpgrades(template: BusinessTemplate, currentLevel: number, balance: Money): number {
  const base = M(template.baseCost);
  const r = COST_GROWTH;
  const currCost = base.times(r.pow(currentLevel));
  if (currCost.gt(balance)) return 0;
  const numerator = balance.times(r.minus(1)).div(currCost).plus(1);
  const log = Decimal.ln(numerator).div(Decimal.ln(r));
  const n = Math.floor(log.toNumber());
  return Math.max(0, Math.min(n, template.maxLevel - currentLevel));
}

export function levelIncomePerCycle(template: BusinessTemplate, level: number): Money {
  if (level <= 0) return ZERO;
  return M(template.baseIncome).times(INCOME_GROWTH.pow(level - 1));
}

export function levelIncomePerHour(template: BusinessTemplate, level: number): Money {
  if (level <= 0) return ZERO;
  const perCycle = levelIncomePerCycle(template, level);
  const cyclesPerHour = 3600 / template.cycleSeconds;
  return perCycle.times(cyclesPerHour);
}

const MAX_PENDING_SECONDS = 8 * 3600; // 8h cap on accumulated pending cycles

export function pendingCycles(template: BusinessTemplate, lastCollectedAt: number, nowMs: number): number {
  const elapsedSec = Math.min((nowMs - lastCollectedAt) / 1000, MAX_PENDING_SECONDS);
  if (elapsedSec < template.cycleSeconds) return 0;
  return Math.floor(elapsedSec / template.cycleSeconds);
}

// Returns fractional cycles for showing current accumulated earnings
export function pendingFractionalCycles(template: BusinessTemplate, lastCollectedAt: number, nowMs: number): number {
  const elapsedSec = Math.min((nowMs - lastCollectedAt) / 1000, MAX_PENDING_SECONDS);
  if (elapsedSec <= 0) return 0;
  return elapsedSec / template.cycleSeconds;
}

export function pendingReward(template: BusinessTemplate, level: number, lastCollectedAt: number, nowMs: number): Money {
  const cycles = pendingFractionalCycles(template, lastCollectedAt, nowMs);
  if (cycles <= 0) return ZERO;
  return levelIncomePerCycle(template, level).times(cycles);
}

export interface PlayerLevel {
  level: number;
  title: string;
  nextThreshold: Money | null;
  progress: number;
  globalIncomeMultiplier: Decimal;
}

const LEVEL_THRESHOLDS = [
  { level: 1,  threshold: '0',     title: 'Hustler' },
  { level: 2,  threshold: '1000',  title: 'Side Hustler' },
  { level: 3,  threshold: '10000', title: 'Small Owner' },
  { level: 4,  threshold: '100000',title: 'Entrepreneur' },
  { level: 5,  threshold: '1000000', title: 'Millionaire' },
  { level: 6,  threshold: '10000000', title: 'Investor' },
  { level: 7,  threshold: '100000000', title: 'Magnate' },
  { level: 8,  threshold: '1000000000', title: 'Billionaire' },
  { level: 9,  threshold: '10000000000', title: 'Tycoon' },
  { level: 10, threshold: '100000000000', title: 'Mogul' },
  { level: 11, threshold: '1e12', title: 'Trillionaire' },
  { level: 12, threshold: '1e15', title: 'Empire Architect' },
  { level: 13, threshold: '1e18', title: 'Wealth Titan' },
  { level: 14, threshold: '1e21', title: 'Demi-Croesus' },
  { level: 15, threshold: '1e24', title: 'Cosmic Capitalist' },
];

export function computePlayerLevel(networth: Money): PlayerLevel {
  let active = LEVEL_THRESHOLDS[0];
  let next: typeof LEVEL_THRESHOLDS[number] | null = LEVEL_THRESHOLDS[1] ?? null;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (networth.gte(LEVEL_THRESHOLDS[i].threshold)) {
      active = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] ?? null;
    } else {
      break;
    }
  }
  let progress = 1;
  if (next) {
    const lo = new Decimal(active.threshold);
    const hi = new Decimal(next.threshold);
    if (hi.gt(lo)) {
      progress = networth.minus(lo).div(hi.minus(lo)).toNumber();
      progress = Math.max(0, Math.min(1, progress));
    }
  }
  return {
    level: active.level,
    title: active.title,
    nextThreshold: next ? M(next.threshold) : null,
    progress,
    globalIncomeMultiplier: new Decimal(1).plus(new Decimal(active.level - 1).times('0.01')),
  };
}

export function tapBaseReward(playerLevel: number, balance: Money): Money {
  const base = new Decimal('0.10').times(new Decimal('1.85').pow(playerLevel - 1));
  const cap = balance.times('0.001').plus('1');
  return Decimal.min(base, cap);
}

export function prestigeStarsAvailable(networth: Money): number {
  if (networth.lt('1e9')) return 0;
  const stars = networth.div('1e9').floor().toNumber();
  return Math.min(stars, 50);
}
