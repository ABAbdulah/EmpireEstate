import { create } from 'zustand';
import { produce } from 'immer';
import Decimal from 'decimal.js';
import { GameState, INITIAL_STATE, ActiveBoost, CarBusiness, CarInventoryItem, OwnedProperty } from './types';
import { loadState, saveState } from './storage';
import { M, Money, ZERO } from '../lib/money';
import { businessTemplate, computePlayerLevel, levelIncomePerCycle, levelIncomePerHour, pendingCycles, pendingReward, tapBaseReward, upgradeCost } from '../game/economy';
import { BUSINESSES, MERGER_RECIPES, getItEmployeeCounts } from '../content/businesses';
import { getProjectById, isProjectUnlocked } from '../content/projects';
import { STOCKS, CRYPTOS } from '../content/stocks';
import { SHOWROOM_SIZES, SERVICE_SIZES, SPECIALIZATIONS, generateUsedCarOffer, CAR_CATALOG } from '../content/carBusiness';
import { PROPERTIES, PROPERTY_UPGRADES, propertyRentPerHour } from '../content/realEstate';
import { ITEMS, COLLECTIONS, computeCollectionMultipliers } from '../content/items';
import { SkillKey } from '../content/carBusiness';

interface StoreState {
  state: GameState;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  reset: () => Promise<void>;

  tick: (nowMs: number) => { gained: Money; bySource: Record<string, string> };

  doTap: () => Money;

  buyBusiness: (templateId: string, customName?: string) => boolean;
  upgradeBusiness: (templateId: string, qty: number | 'max') => boolean;
  hireManager: (templateId: string) => boolean;
  renameBusiness: (templateId: string, name: string) => void;
  collectBusiness: (templateId: string, nowMs: number) => Money;
  collectAllBusinesses: (nowMs: number) => Money;

  buyStock: (ticker: string, qty: number, price: number) => boolean;
  sellStock: (ticker: string, qty: number, price: number) => boolean;
  buyCrypto: (symbol: string, qty: number, price: number) => boolean;
  sellCrypto: (symbol: string, qty: number, price: number) => boolean;

  buyItem: (templateId: string, price: string) => boolean;

  buyProperty: (templateId: string) => boolean;
  sellProperty: (uid: string) => boolean;
  upgradeProperty: (uid: string, upgradeId: string) => boolean;

  addBoost: (boost: ActiveBoost) => void;
  payTaxes: () => boolean;
  prestige: () => boolean;
  updateSettings: (key: keyof GameState['settings'], value: boolean) => void;
  upgradeCarSkill: (uid: string, skill: SkillKey) => boolean;
  completeMerger: (id: string) => boolean;

  startProject: (businessId: string, projectId: string) => { ok: boolean; reason?: string };
  collectProject: (businessId: string) => { ok: boolean; reward?: string };

  createCarBusiness: (params: {
    name: string;
    showroomType: 'used' | 'new';
    showroomSize: 'small' | 'mid' | 'large';
    specialization: 'mass' | 'luxury' | 'premium';
  }) => { ok: boolean; uid?: string; reason?: string };
  buyCarServiceForBusiness: (uid: string, size: 'small' | 'mid' | 'large') => boolean;
  setCarSpecialization: (uid: string, specialization: 'mass' | 'luxury' | 'premium') => void;
  buyCarForInventory: (uid: string, catalogId: string, askPrice: string, condition: number) => boolean;
  sellCarFromInventory: (uid: string, carUid: string, salePrice: string) => boolean;
  collectCarBusiness: (uid: string, nowMs: number) => Money;

  fixCarPart: (businessUid: string, carUid: string, part: 'engine' | 'transmission' | 'chassis' | 'body') => { ok: boolean; reason?: string };
  listCarForSale: (businessUid: string, carUid: string) => { ok: boolean; reason?: string };
  cancelCarListing: (businessUid: string, carUid: string) => boolean;
}

// Pricing helpers exported for UI use

// Each part has its own cost band as a fraction of the car's purchase price.
// Total of all 4 parts averages ~22% of purchase price.
const PART_COST_RANGES: Record<string, [number, number]> = {
  engine:       [0.07, 0.10],
  transmission: [0.05, 0.07],
  chassis:      [0.04, 0.06],
  body:         [0.03, 0.05],
};

export function carFixCost(purchasePrice: string, part: string, carUid: string = ''): Money {
  const range = PART_COST_RANGES[part] ?? [0.04, 0.06];
  // Seeded by car uid + part for stable, per-car pricing
  let hash = 0;
  const key = carUid + part;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 1000000;
  const factor = range[0] + ((hash % 1000) / 1000) * (range[1] - range[0]);
  return M(purchasePrice).times(factor).ceil();
}

export function carConditionAfterFix(currentCondition: number): number {
  return Math.min(1, currentCondition + 0.15);
}

export function carMarketPrice(item: CarInventoryItem, catalogBasePrice: number, _segment: string): Money {
  // Market price = (basePrice * 0.6..1.3 random based on uid) * condition
  // Plus 50% of fixes spent recovered
  // Random factor seeded by uid so it stays stable
  let hash = 0;
  for (let i = 0; i < item.uid.length; i++) hash = (hash * 31 + item.uid.charCodeAt(i)) % 1000000;
  const factor = 0.65 + ((hash % 1000) / 1000) * 0.6; // 0.65..1.25
  const condition = typeof item.condition === 'number' ? item.condition : 0.5;
  const conditionMult = 0.4 + condition * 0.7; // condition 0..1 → 0.4..1.1
  const marketBase = M(catalogBasePrice).times(factor).times(conditionMult);
  const fixesValue = M(item.fixesSpent ?? '0').times('0.5');
  return marketBase.plus(fixesValue).ceil();
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(state: GameState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState(state).catch(() => {});
  }, 250);
}

function activeMultiplier(boosts: ActiveBoost[], id: ActiveBoost['id'], nowMs: number): number {
  const active = boosts.filter((b) => b.id === id && b.endsAt > nowMs);
  return active.reduce((m, b) => m * b.multiplier, 1);
}

export function computeMergerMultiplier(completedMergers: string[]): number {
  let mult = 1;
  for (const recipe of MERGER_RECIPES) {
    if (completedMergers.includes(recipe.id)) {
      mult *= (1 + recipe.incomeBonus);
    }
  }
  return mult;
}

export function aggregateIncomePerHour(state: GameState): Money {
  const level = computePlayerLevel(M(state.balance));
  const colMult = computeCollectionMultipliers(state.collections);
  let total = ZERO;
  for (const [id, owned] of Object.entries(state.businesses)) {
    if (owned.level <= 0) continue;
    const t = businessTemplate(id);
    const baseHourly = levelIncomePerHour(t, owned.level);
    const mgrMult = owned.hasManager ? new Decimal('1.25') : new Decimal('1');
    total = total.plus(baseHourly.times(mgrMult));
  }
  for (const cb of state.carBusinesses) {
    const spec = SPECIALIZATIONS.find((s) => s.id === cb.specialization);
    if (!spec) continue;
    total = total.plus(M(spec.baseHourlyPerVehicle).times(cb.inventory.length));
  }
  total = total.times(level.globalIncomeMultiplier);
  total = total.times(new Decimal(1).plus(new Decimal(state.prestigeStars).times('0.02')));
  total = total.times(colMult.globalIncomeMult);
  total = total.times(computeMergerMultiplier(state.completedMergers));
  return total;
}

export const useGame = create<StoreState>((set, get) => ({
  state: INITIAL_STATE,
  hydrated: false,

  hydrate: async () => {
    const loaded = await loadState();
    // Migrate old saves that don't have new fields yet
    const migrated: GameState = {
      ...loaded,
      activeProjects: loaded.activeProjects ?? [],
      projectsCompleted: loaded.projectsCompleted ?? {},
      completedMergers: loaded.completedMergers ?? [],
      carBusinesses: (loaded.carBusinesses ?? []).map((cb) => ({
        ...cb,
        inventory: (cb.inventory ?? []).map((c) => ({
          ...c,
          fixesSpent: c.fixesSpent ?? '0',
          fixedParts: c.fixedParts ?? [],
          forSale: c.forSale ?? false,
        })),
      })),
    };
    set({ state: migrated, hydrated: true });
  },

  reset: async () => {
    const fresh = { ...INITIAL_STATE, installedAt: Date.now(), lastTickAt: Date.now() };
    set({ state: fresh });
    await saveState(fresh);
  },

  tick: (nowMs) => {
    const before = get().state;
    const elapsedMs = Math.max(0, nowMs - before.lastTickAt);
    const cap = before.vip ? 24 * 3600_000 : 8 * 3600_000;
    const cappedMs = Math.min(elapsedMs, cap);

    const bySource: Record<string, string> = {};
    let gained = ZERO;
    const businessMult = activeMultiplier(before.boosts, 'business_30', nowMs) * activeMultiplier(before.boosts, 'business_100', nowMs);
    const playerLevel = computePlayerLevel(M(before.balance));
    const prestigeMult = new Decimal(1).plus(new Decimal(before.prestigeStars).times('0.02'));
    const colMult = computeCollectionMultipliers(before.collections);
    const mergerMult = computeMergerMultiplier(before.completedMergers);

    const newBusinesses: GameState['businesses'] = {};
    for (const [id, owned] of Object.entries(before.businesses)) {
      const t = businessTemplate(id);
      let level = owned.level;
      let lastCollectedAt = owned.lastCollectedAt;
      let totalEarned = M(owned.totalEarned);

      if (level > 0 && owned.hasManager) {
        const elapsedSinceCollect = (nowMs - owned.lastCollectedAt) / 1000;
        const cycles = Math.floor(Math.min(elapsedSinceCollect, cappedMs / 1000) / t.cycleSeconds);
        if (cycles > 0) {
          const reward = levelIncomePerCycle(t, level)
            .times(cycles)
            .times(playerLevel.globalIncomeMultiplier)
            .times(prestigeMult)
            .times(businessMult)
            .times(colMult.businessIncomeMult)
            .times(colMult.globalIncomeMult)
            .times(mergerMult)
            .times('1.25');
          gained = gained.plus(reward);
          totalEarned = totalEarned.plus(reward);
          bySource[id] = (bySource[id] ? M(bySource[id]).plus(reward) : reward).toString();
          lastCollectedAt = owned.lastCollectedAt + cycles * t.cycleSeconds * 1000;
        }
      }
      newBusinesses[id] = {
        ...owned,
        level,
        lastCollectedAt,
        totalEarned: totalEarned.toString(),
      };
    }

    // Rent income from properties (always auto-collected, proportional to elapsed)
    for (const prop of before.properties) {
      const tmpl = PROPERTIES.find((p) => p.id === prop.templateId);
      if (!tmpl) continue;
      const hourlyRent = propertyRentPerHour(tmpl, prop.upgrades);
      const rentEarned = M(hourlyRent).times(cappedMs / 3_600_000);
      gained = gained.plus(rentEarned);
      bySource['real_estate'] = M(bySource['real_estate'] ?? '0').plus(rentEarned).toString();
    }

    const newBoosts = before.boosts.filter((b) => b.endsAt > nowMs);

    // Auto-sell cars whose for-sale duration has completed
    let carSaleGain = ZERO;
    const newCarBusinesses = before.carBusinesses.map((cb) => {
      const remaining: CarInventoryItem[] = [];
      let businessGain = ZERO;
      for (const car of cb.inventory) {
        if (car.forSale && car.forSaleCompletesAt && nowMs >= car.forSaleCompletesAt) {
          const tmpl = CAR_CATALOG.find((c) => c.id === car.catalogId);
          if (tmpl) {
            const price = carMarketPrice(car, tmpl.basePrice, tmpl.segment);
            businessGain = businessGain.plus(price);
            carSaleGain = carSaleGain.plus(price);
            continue; // sold — drop from inventory
          }
        }
        remaining.push(car);
      }
      return {
        ...cb,
        inventory: remaining,
        totalEarned: M(cb.totalEarned).plus(businessGain).toString(),
      };
    });

    const totalGained = gained.plus(carSaleGain);
    if (carSaleGain.gt(0)) {
      bySource['car_sales'] = carSaleGain.toString();
    }

    const newState: GameState = {
      ...before,
      businesses: newBusinesses,
      carBusinesses: newCarBusinesses,
      balance: M(before.balance).plus(totalGained).toString(),
      totalEarned: M(before.totalEarned).plus(totalGained).toString(),
      lastTickAt: nowMs,
      boosts: newBoosts,
      taxAccrued: M(before.taxAccrued).plus(totalGained.times('0.12')).toString(),
    };

    set({ state: newState });
    scheduleSave(newState);

    return { gained: totalGained, bySource };
  },

  doTap: () => {
    const before = get().state;
    const playerLevel = computePlayerLevel(M(before.balance));
    const base = tapBaseReward(before.tapLevel, M(before.balance));
    const tapMult = activeMultiplier(before.boosts, 'tap_2x', Date.now());
    const colMult = computeCollectionMultipliers(before.collections);
    const reward = base.times(playerLevel.globalIncomeMultiplier).times(tapMult).times(colMult.tapEarningsMult).times(colMult.globalIncomeMult);

    const newXp = before.tapXp + 1;
    const xpForNext = before.tapLevel * 20;
    let newLevel = before.tapLevel;
    let remainingXp = newXp;
    if (newXp >= xpForNext) {
      newLevel = before.tapLevel + 1;
      remainingXp = newXp - xpForNext;
    }

    const newState: GameState = {
      ...before,
      balance: M(before.balance).plus(reward).toString(),
      totalEarned: M(before.totalEarned).plus(reward).toString(),
      totalTaps: before.totalTaps + 1,
      tapXp: remainingXp,
      tapLevel: newLevel,
    };
    set({ state: newState });
    scheduleSave(newState);
    return reward;
  },

  buyBusiness: (templateId, customName) => {
    const before = get().state;
    if (before.businesses[templateId] && before.businesses[templateId].level > 0) return false;
    const t = businessTemplate(templateId);
    const cost = M(t.baseCost);
    if (M(before.balance).lt(cost)) return false;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.businesses[templateId] = {
        templateId,
        customName: customName?.trim() || undefined,
        level: 1,
        hasManager: false,
        lastCollectedAt: Date.now(),
        totalEarned: '0',
      };
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  upgradeBusiness: (templateId, qty) => {
    const before = get().state;
    const owned = before.businesses[templateId];
    if (!owned) return false;
    const t = businessTemplate(templateId);
    let n: number;
    if (qty === 'max') {
      const bal = M(before.balance);
      n = Math.min(t.maxLevel - owned.level, maxQty(t.baseCost, owned.level, bal));
    } else {
      n = Math.min(qty, t.maxLevel - owned.level);
    }
    if (n <= 0) return false;
    const cost = upgradeCost(t, owned.level, n);
    if (M(before.balance).lt(cost)) return false;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.businesses[templateId].level += n;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  hireManager: (templateId) => {
    const before = get().state;
    const owned = before.businesses[templateId];
    if (!owned || owned.hasManager) return false;
    const t = businessTemplate(templateId);
    const cost = M(t.managerCost);
    if (M(before.balance).lt(cost)) return false;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.businesses[templateId].hasManager = true;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  collectBusiness: (templateId, nowMs) => {
    const before = get().state;
    const owned = before.businesses[templateId];
    if (!owned || owned.level <= 0 || owned.hasManager) return ZERO;
    const t = businessTemplate(templateId);
    // Allow fractional cycles — partial time still gets partial reward
    const MAX_PENDING_SECONDS = 8 * 3600;
    const elapsedSec = Math.min((nowMs - owned.lastCollectedAt) / 1000, MAX_PENDING_SECONDS);
    const cycles = elapsedSec / t.cycleSeconds;
    if (cycles <= 0) return ZERO;
    const playerLevel = computePlayerLevel(M(before.balance));
    const prestigeMult = new Decimal(1).plus(new Decimal(before.prestigeStars).times('0.02'));
    const businessMult = activeMultiplier(before.boosts, 'business_30', nowMs) * activeMultiplier(before.boosts, 'business_100', nowMs);
    const colMult = computeCollectionMultipliers(before.collections);
    const mergerMult = computeMergerMultiplier(before.completedMergers);
    const reward = levelIncomePerCycle(t, owned.level)
      .times(cycles)
      .times(playerLevel.globalIncomeMultiplier)
      .times(prestigeMult)
      .times(businessMult)
      .times(colMult.businessIncomeMult)
      .times(colMult.globalIncomeMult)
      .times(mergerMult);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(reward).toString();
      draft.totalEarned = M(draft.totalEarned).plus(reward).toString();
      draft.businesses[templateId].lastCollectedAt = nowMs;
      draft.businesses[templateId].totalEarned = M(draft.businesses[templateId].totalEarned).plus(reward).toString();
      draft.taxAccrued = M(draft.taxAccrued).plus(reward.times('0.12')).toString();
    });
    set({ state: next });
    scheduleSave(next);
    return reward;
  },

  collectAllBusinesses: (nowMs) => {
    const before = get().state;
    const playerLevel = computePlayerLevel(M(before.balance));
    const prestigeMult = new Decimal(1).plus(new Decimal(before.prestigeStars).times('0.02'));
    const businessMult = activeMultiplier(before.boosts, 'business_30', nowMs) * activeMultiplier(before.boosts, 'business_100', nowMs);
    const colMult = computeCollectionMultipliers(before.collections);
    const mergerMult = computeMergerMultiplier(before.completedMergers);
    const MAX_PENDING_SECONDS = 8 * 3600;
    let total = ZERO;
    const updates: Record<string, { lastCollectedAt: number; addedEarned: Decimal }> = {};
    for (const [id, owned] of Object.entries(before.businesses)) {
      if (owned.level <= 0 || owned.hasManager) continue;
      const t = businessTemplate(id);
      // Allow fractional cycles
      const elapsedSec = Math.min((nowMs - owned.lastCollectedAt) / 1000, MAX_PENDING_SECONDS);
      const cycles = elapsedSec / t.cycleSeconds;
      if (cycles <= 0) continue;
      const reward = levelIncomePerCycle(t, owned.level)
        .times(cycles)
        .times(playerLevel.globalIncomeMultiplier)
        .times(prestigeMult)
        .times(businessMult)
        .times(colMult.businessIncomeMult)
        .times(colMult.globalIncomeMult)
        .times(mergerMult);
      total = total.plus(reward);
      updates[id] = {
        lastCollectedAt: nowMs,
        addedEarned: reward,
      };
    }
    if (total.lte(0)) return ZERO;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(total).toString();
      draft.totalEarned = M(draft.totalEarned).plus(total).toString();
      draft.taxAccrued = M(draft.taxAccrued).plus(total.times('0.12')).toString();
      for (const [id, u] of Object.entries(updates)) {
        draft.businesses[id].lastCollectedAt = u.lastCollectedAt;
        draft.businesses[id].totalEarned = M(draft.businesses[id].totalEarned).plus(u.addedEarned).toString();
      }
    });
    set({ state: next });
    scheduleSave(next);
    return total;
  },

  renameBusiness: (templateId, name) => {
    const before = get().state;
    const trimmed = name.trim();
    const next = produce(before, (draft) => {
      if (!draft.businesses[templateId]) return;
      draft.businesses[templateId].customName = trimmed || undefined;
    });
    set({ state: next });
    scheduleSave(next);
  },

  buyStock: (ticker, qty, price) => {
    const before = get().state;
    const total = M(price).times(qty);
    if (M(before.balance).lt(total)) return false;
    const existing = before.stocks[ticker];
    const newQty = (existing?.quantity ?? 0) + qty;
    const newAvgCost = existing
      ? M(existing.avgCost).times(existing.quantity).plus(total).div(newQty).toString()
      : price.toString();
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(total).toString();
      draft.totalSpent = M(draft.totalSpent).plus(total).toString();
      draft.stocks[ticker] = { ticker, quantity: newQty, avgCost: newAvgCost };
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  sellStock: (ticker, qty, price) => {
    const before = get().state;
    const owned = before.stocks[ticker];
    if (!owned || owned.quantity < qty) return false;
    const total = M(price).times(qty);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(total).toString();
      draft.totalEarned = M(draft.totalEarned).plus(total).toString();
      const remaining = owned.quantity - qty;
      if (remaining === 0) delete draft.stocks[ticker];
      else draft.stocks[ticker].quantity = remaining;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  buyCrypto: (symbol, qty, price) => {
    const before = get().state;
    const total = M(price).times(qty);
    if (M(before.balance).lt(total)) return false;
    const existing = before.cryptos[symbol];
    const newQty = (existing?.quantity ?? 0) + qty;
    const newAvgCost = existing
      ? M(existing.avgCost).times(existing.quantity).plus(total).div(newQty).toString()
      : price.toString();
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(total).toString();
      draft.totalSpent = M(draft.totalSpent).plus(total).toString();
      draft.cryptos[symbol] = { symbol, quantity: newQty, avgCost: newAvgCost };
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  sellCrypto: (symbol, qty, price) => {
    const before = get().state;
    const owned = before.cryptos[symbol];
    if (!owned || owned.quantity < qty) return false;
    const total = M(price).times(qty);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(total).toString();
      draft.totalEarned = M(draft.totalEarned).plus(total).toString();
      const remaining = owned.quantity - qty;
      if (remaining === 0) delete draft.cryptos[symbol];
      else draft.cryptos[symbol].quantity = remaining;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  buyItem: (templateId, price) => {
    const before = get().state;
    const cost = M(price);
    if (M(before.balance).lt(cost)) return false;
    const tmpl = ITEMS.find((i) => i.id === templateId);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.items.push({
        uid: `${templateId}-${Date.now()}`,
        templateId,
        purchasePrice: price,
        purchaseDate: Date.now(),
        currentValueMultiplier: 1,
      });
      if (tmpl?.collectionId) {
        const colId = tmpl.collectionId;
        if (!draft.collections[colId]) draft.collections[colId] = [];
        if (!draft.collections[colId].includes(templateId)) {
          draft.collections[colId].push(templateId);
        }
      }
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  buyProperty: (templateId) => {
    const before = get().state;
    const tmpl = PROPERTIES.find((p) => p.id === templateId);
    if (!tmpl) return false;
    if (M(before.balance).lt(tmpl.price)) return false;
    const uid = `${templateId}-${Date.now()}`;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(tmpl.price).toString();
      draft.totalSpent = M(draft.totalSpent).plus(tmpl.price).toString();
      draft.properties.push({ uid, templateId, purchasePrice: tmpl.price.toString(), purchasedAt: Date.now(), upgrades: [], totalEarned: '0' });
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  sellProperty: (uid) => {
    const before = get().state;
    const prop = before.properties.find((p) => p.uid === uid);
    if (!prop) return false;
    const tmpl = PROPERTIES.find((p) => p.id === prop.templateId);
    if (!tmpl) return false;
    // Market value after upgrades, minus sales tax
    let valueMultiplier = 1;
    for (const upId of prop.upgrades) {
      const u = PROPERTY_UPGRADES.find((u) => u.id === upId);
      if (u) valueMultiplier += u.valueBoost;
    }
    const marketValue = M(prop.purchasePrice).times(valueMultiplier);
    const proceeds = marketValue.times(1 - tmpl.salesTaxRate);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(proceeds).toString();
      draft.totalEarned = M(draft.totalEarned).plus(proceeds).toString();
      draft.properties = draft.properties.filter((p) => p.uid !== uid);
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  upgradeProperty: (uid, upgradeId) => {
    const before = get().state;
    const prop = before.properties.find((p) => p.uid === uid);
    if (!prop || prop.upgrades.includes(upgradeId)) return false;
    const tmpl = PROPERTIES.find((p) => p.id === prop.templateId);
    const upgrade = PROPERTY_UPGRADES.find((u) => u.id === upgradeId);
    if (!tmpl || !upgrade) return false;
    const cost = M(prop.purchasePrice).times(upgrade.costFraction);
    if (M(before.balance).lt(cost)) return false;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      const p = draft.properties.find((p) => p.uid === uid)!;
      p.upgrades.push(upgradeId);
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  addBoost: (boost) => {
    const before = get().state;
    const next = produce(before, (draft) => {
      draft.boosts.push(boost);
    });
    set({ state: next });
    scheduleSave(next);
  },

  payTaxes: () => {
    const before = get().state;
    const due = M(before.taxAccrued);
    if (due.lte(0)) return true;
    if (M(before.balance).lt(due)) return false;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(due).toString();
      draft.totalSpent = M(draft.totalSpent).plus(due).toString();
      draft.taxAccrued = '0';
      draft.taxDueAt = Date.now() + 7 * 86_400_000;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  prestige: () => {
    const before = get().state;
    const networth = computeNetworth(before);
    const threshold = M('1000000').times(new Decimal('5').pow(before.prestigeCount));
    if (networth.lt(threshold)) return false;
    const next = produce({ ...INITIAL_STATE } as typeof before, (draft) => {
      draft.prestigeStars = before.prestigeStars + 1;
      draft.prestigeCount = before.prestigeCount + 1;
      draft.items = before.items;
      draft.collections = before.collections;
      draft.settings = before.settings;
      draft.vip = before.vip;
      draft.noAds = before.noAds;
      draft.installedAt = before.installedAt;
      draft.lastTickAt = Date.now();
      draft.taxDueAt = Date.now() + 7 * 86_400_000;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  updateSettings: (key, value) => {
    const before = get().state;
    const next = produce(before, (draft) => {
      draft.settings[key] = value;
    });
    set({ state: next });
    scheduleSave(next);
  },

  upgradeCarSkill: (uid, skill) => {
    const before = get().state;
    const idx = before.carBusinesses.findIndex((b) => b.uid === uid);
    if (idx < 0) return false;
    const cb = before.carBusinesses[idx];
    const currentLevel = cb.skills[skill];
    if (currentLevel >= 10) return false;
    const cost = M('50000').times(currentLevel * currentLevel);
    if (M(before.balance).lt(cost)) return false;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.carBusinesses[idx].skills[skill] = currentLevel + 1;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  completeMerger: (id) => {
    const before = get().state;
    if (before.completedMergers.includes(id)) return false;
    const recipe = MERGER_RECIPES.find((r) => r.id === id);
    if (!recipe) return false;
    // Check all requirements
    for (const req of recipe.requirements) {
      const owned = before.businesses[req.businessId];
      if (!owned || owned.level < req.minLevel) return false;
    }
    const cost = M(recipe.investmentCost);
    if (M(before.balance).lt(cost)) return false;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.completedMergers.push(id);
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  startProject: (businessId, projectId) => {
    const before = get().state;
    const project = getProjectById(projectId);
    if (!project || project.businessId !== businessId) return { ok: false, reason: 'Unknown project' };
    // One active project per business at a time
    const alreadyRunning = before.activeProjects.find((p) => p.businessId === businessId);
    if (alreadyRunning) return { ok: false, reason: 'A project is already running for this business' };
    // Unlock check
    if (!isProjectUnlocked(project, before.projectsCompleted)) {
      return { ok: false, reason: 'Project locked — complete previous tier first' };
    }
    // Cost check
    if (M(before.balance).lt(project.cost)) {
      return { ok: false, reason: 'Insufficient funds' };
    }
    // IT staff check (level controls available staff)
    if (project.staffRequired) {
      const owned = before.businesses[businessId];
      const level = owned?.level ?? 0;
      const counts = getItEmployeeCounts(level);
      for (const [role, need] of Object.entries(project.staffRequired)) {
        if ((counts[role] ?? 0) < need) {
          return { ok: false, reason: `Need ${need} ${role.replace('_', ' ')}(s) — upgrade business level` };
        }
      }
    }
    const now = Date.now();
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(project.cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(project.cost).toString();
      draft.activeProjects.push({
        businessId,
        projectId,
        startedAt: now,
        completesAt: now + project.durationSeconds * 1000,
      });
    });
    set({ state: next });
    scheduleSave(next);
    return { ok: true };
  },

  collectProject: (businessId) => {
    const before = get().state;
    const active = before.activeProjects.find((p) => p.businessId === businessId);
    if (!active) return { ok: false };
    if (Date.now() < active.completesAt) return { ok: false };
    const project = getProjectById(active.projectId);
    if (!project) return { ok: false };
    const reward = M(project.reward);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(reward).toString();
      draft.totalEarned = M(draft.totalEarned).plus(reward).toString();
      draft.activeProjects = draft.activeProjects.filter(
        (p) => !(p.businessId === businessId && p.projectId === active.projectId && p.startedAt === active.startedAt)
      );
      draft.projectsCompleted[active.projectId] = (draft.projectsCompleted[active.projectId] ?? 0) + 1;
      draft.taxAccrued = M(draft.taxAccrued).plus(reward.times('0.12')).toString();
    });
    set({ state: next });
    scheduleSave(next);
    return { ok: true, reward: reward.toString() };
  },

  createCarBusiness: ({ name, showroomType, showroomSize, specialization }) => {
    const before = get().state;
    const size = SHOWROOM_SIZES.find((s) => s.id === showroomSize);
    if (!size) return { ok: false, reason: 'Unknown size' };
    const cost = M(showroomType === 'used' ? size.costUsed : size.costNew);
    if (M(before.balance).lt(cost)) {
      return { ok: false, reason: `Need ${cost.toString()} to open this showroom` };
    }
    const uid = `car-${Date.now()}`;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.carBusinesses.push({
        uid,
        name: name.trim() || 'My Showroom',
        showroomType,
        showroomSize,
        showroomCapacity: size.capacity,
        serviceSize: null,
        serviceCapacity: 0,
        specialization,
        skills: { engine: 1, transmission: 1, chassis: 1, body: 1 },
        skillRepairs: { engine: 0, transmission: 0, chassis: 0, body: 0 },
        inventory: [],
        lastCollectedAt: Date.now(),
        totalEarned: '0',
        createdAt: Date.now(),
      });
    });
    set({ state: next });
    scheduleSave(next);
    return { ok: true, uid };
  },

  buyCarServiceForBusiness: (uid, size) => {
    const before = get().state;
    const ss = SERVICE_SIZES.find((s) => s.id === size);
    if (!ss) return false;
    const cost = M(ss.cost);
    if (M(before.balance).lt(cost)) return false;
    const idx = before.carBusinesses.findIndex((b) => b.uid === uid);
    if (idx < 0) return false;
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.carBusinesses[idx].serviceSize = size;
      draft.carBusinesses[idx].serviceCapacity = ss.capacity;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  setCarSpecialization: (uid, specialization) => {
    const before = get().state;
    const next = produce(before, (draft) => {
      const idx = draft.carBusinesses.findIndex((b) => b.uid === uid);
      if (idx >= 0) draft.carBusinesses[idx].specialization = specialization;
    });
    set({ state: next });
    scheduleSave(next);
  },

  buyCarForInventory: (uid, catalogId, askPrice, condition) => {
    const before = get().state;
    const cost = M(askPrice);
    if (M(before.balance).lt(cost)) return false;
    const idx = before.carBusinesses.findIndex((b) => b.uid === uid);
    if (idx < 0) return false;
    if (before.carBusinesses[idx].inventory.length >= before.carBusinesses[idx].showroomCapacity) return false;
    const item: CarInventoryItem = {
      uid: `inv-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      catalogId,
      purchasePrice: askPrice,
      askPrice,
      condition,
      acquiredAt: Date.now(),
      fixesSpent: '0',
      fixedParts: [],
      forSale: false,
    };
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      draft.carBusinesses[idx].inventory.push(item);
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  sellCarFromInventory: (uid, carUid, salePrice) => {
    const before = get().state;
    const idx = before.carBusinesses.findIndex((b) => b.uid === uid);
    if (idx < 0) return false;
    const car = before.carBusinesses[idx].inventory.find((c) => c.uid === carUid);
    if (!car) return false;
    const sale = M(salePrice);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(sale).toString();
      draft.totalEarned = M(draft.totalEarned).plus(sale).toString();
      draft.carBusinesses[idx].inventory = draft.carBusinesses[idx].inventory.filter((c) => c.uid !== carUid);
      draft.carBusinesses[idx].totalEarned = M(draft.carBusinesses[idx].totalEarned).plus(sale).toString();
      draft.taxAccrued = M(draft.taxAccrued).plus(sale.times('0.12')).toString();
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },

  collectCarBusiness: (uid, nowMs) => {
    const before = get().state;
    const idx = before.carBusinesses.findIndex((b) => b.uid === uid);
    if (idx < 0) return ZERO;
    const cb = before.carBusinesses[idx];
    const elapsedMs = nowMs - cb.lastCollectedAt;
    if (elapsedMs < 1000) return ZERO;
    const spec = SPECIALIZATIONS.find((s) => s.id === cb.specialization);
    if (!spec) return ZERO;
    const inventoryCount = cb.inventory.length;
    const perHour = M(spec.baseHourlyPerVehicle).times(inventoryCount);
    const gained = perHour.times(elapsedMs).div(3_600_000);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(gained).toString();
      draft.totalEarned = M(draft.totalEarned).plus(gained).toString();
      draft.carBusinesses[idx].lastCollectedAt = nowMs;
      draft.carBusinesses[idx].totalEarned = M(draft.carBusinesses[idx].totalEarned).plus(gained).toString();
      draft.taxAccrued = M(draft.taxAccrued).plus(gained.times('0.12')).toString();
    });
    set({ state: next });
    scheduleSave(next);
    return gained;
  },

  fixCarPart: (businessUid, carUid, part) => {
    const before = get().state;
    const bizIdx = before.carBusinesses.findIndex((b) => b.uid === businessUid);
    if (bizIdx < 0) return { ok: false, reason: 'Business not found' };
    const car = before.carBusinesses[bizIdx].inventory.find((c) => c.uid === carUid);
    if (!car) return { ok: false, reason: 'Car not found' };
    if (car.forSale) return { ok: false, reason: 'Cannot fix a car that is listed for sale' };
    if ((car.fixedParts ?? []).includes(part)) return { ok: false, reason: 'This part is already fixed' };
    const cost = carFixCost(car.purchasePrice, part, car.uid);
    if (M(before.balance).lt(cost)) return { ok: false, reason: 'Insufficient funds' };
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).minus(cost).toString();
      draft.totalSpent = M(draft.totalSpent).plus(cost).toString();
      const c = draft.carBusinesses[bizIdx].inventory.find((x) => x.uid === carUid)!;
      c.fixesSpent = M(c.fixesSpent).plus(cost).toString();
      c.fixedParts = [...(c.fixedParts ?? []), part];
      c.condition = carConditionAfterFix(c.condition);
    });
    set({ state: next });
    scheduleSave(next);
    return { ok: true };
  },

  listCarForSale: (businessUid, carUid) => {
    const before = get().state;
    const bizIdx = before.carBusinesses.findIndex((b) => b.uid === businessUid);
    if (bizIdx < 0) return { ok: false, reason: 'Business not found' };
    const car = before.carBusinesses[bizIdx].inventory.find((c) => c.uid === carUid);
    if (!car) return { ok: false, reason: 'Car not found' };
    if (car.forSale) return { ok: false, reason: 'Already listed for sale' };
    const now = Date.now();
    const durationMs = (10 + Math.floor(Math.random() * 6)) * 60 * 1000; // 10-15 min
    const next = produce(before, (draft) => {
      const c = draft.carBusinesses[bizIdx].inventory.find((x) => x.uid === carUid)!;
      c.forSale = true;
      c.forSaleListedAt = now;
      c.forSaleCompletesAt = now + durationMs;
    });
    set({ state: next });
    scheduleSave(next);
    return { ok: true };
  },

  cancelCarListing: (businessUid, carUid) => {
    const before = get().state;
    const bizIdx = before.carBusinesses.findIndex((b) => b.uid === businessUid);
    if (bizIdx < 0) return false;
    const car = before.carBusinesses[bizIdx].inventory.find((c) => c.uid === carUid);
    if (!car || !car.forSale) return false;
    const next = produce(before, (draft) => {
      const c = draft.carBusinesses[bizIdx].inventory.find((x) => x.uid === carUid)!;
      c.forSale = false;
      c.forSaleListedAt = undefined;
      c.forSaleCompletesAt = undefined;
    });
    set({ state: next });
    scheduleSave(next);
    return true;
  },
}));

function maxQty(baseCost: string, currentLevel: number, balance: Money): number {
  const r = new Decimal('1.07');
  const base = new Decimal(baseCost);
  const currCost = base.times(r.pow(currentLevel));
  if (currCost.gt(balance)) return 0;
  const num = balance.times(r.minus(1)).div(currCost).plus(1);
  const log = Decimal.ln(num).div(Decimal.ln(r));
  return Math.max(0, Math.floor(log.toNumber()));
}

export function computeNetworth(state: GameState): Money {
  let total = M(state.balance);

  for (const [id, owned] of Object.entries(state.businesses)) {
    if (owned.level <= 0) continue;
    const t = businessTemplate(id);
    total = total.plus(M(t.baseCost).times(new Decimal('1.07').pow(owned.level)));
  }

  for (const cb of state.carBusinesses) {
    const sz = SHOWROOM_SIZES.find((s) => s.id === cb.showroomSize);
    if (sz) total = total.plus(M(cb.showroomType === 'used' ? sz.costUsed : sz.costNew));
    if (cb.serviceSize) {
      const svc = SERVICE_SIZES.find((s) => s.id === cb.serviceSize);
      if (svc) total = total.plus(M(svc.cost));
    }
    for (const car of cb.inventory) {
      total = total.plus(M(car.askPrice));
    }
  }

  for (const [ticker, owned] of Object.entries(state.stocks)) {
    const stock = STOCKS.find((s) => s.ticker === ticker);
    const price = stock?.basePrice ?? 0;
    total = total.plus(M(price).times(owned.quantity));
  }

  for (const [symbol, owned] of Object.entries(state.cryptos)) {
    const c = CRYPTOS.find((c) => c.symbol === symbol);
    const price = c?.basePrice ?? 0;
    total = total.plus(M(price).times(owned.quantity));
  }

  for (const prop of state.properties) {
    const tmpl = PROPERTIES.find((p) => p.id === prop.templateId);
    if (!tmpl) continue;
    let mult = 1;
    for (const upId of prop.upgrades) {
      const u = PROPERTY_UPGRADES.find((u) => u.id === upId);
      if (u) mult += u.valueBoost;
    }
    total = total.plus(M(prop.purchasePrice).times(mult));
  }

  for (const item of state.items) {
    total = total.plus(M(item.purchasePrice).times(item.currentValueMultiplier));
  }

  return total;
}

export function aggregateRentPerHour(state: GameState): Money {
  let total = ZERO;
  for (const prop of state.properties) {
    const tmpl = PROPERTIES.find((p) => p.id === prop.templateId);
    if (!tmpl) continue;
    total = total.plus(propertyRentPerHour(tmpl, prop.upgrades));
  }
  return total;
}

export function aggregateBySource(state: GameState): Record<string, Money> {
  const balance = M(state.balance);
  let businesses = ZERO;
  for (const [id, owned] of Object.entries(state.businesses)) {
    if (owned.level <= 0) continue;
    const t = businessTemplate(id);
    businesses = businesses.plus(M(t.baseCost).times(new Decimal('1.07').pow(owned.level)));
  }
  for (const cb of state.carBusinesses) {
    const sz = SHOWROOM_SIZES.find((s) => s.id === cb.showroomSize);
    if (sz) businesses = businesses.plus(M(cb.showroomType === 'used' ? sz.costUsed : sz.costNew));
    if (cb.serviceSize) {
      const svc = SERVICE_SIZES.find((s) => s.id === cb.serviceSize);
      if (svc) businesses = businesses.plus(M(svc.cost));
    }
    for (const car of cb.inventory) {
      businesses = businesses.plus(M(car.askPrice));
    }
  }
  let stocks = ZERO;
  for (const [ticker, owned] of Object.entries(state.stocks)) {
    const s = STOCKS.find((s) => s.ticker === ticker);
    stocks = stocks.plus(M(s?.basePrice ?? 0).times(owned.quantity));
  }
  let crypto = ZERO;
  for (const [symbol, owned] of Object.entries(state.cryptos)) {
    const c = CRYPTOS.find((c) => c.symbol === symbol);
    crypto = crypto.plus(M(c?.basePrice ?? 0).times(owned.quantity));
  }
  let transport = ZERO;
  let collections = ZERO;
  let realEstate = ZERO;
  let residence = ZERO;
  for (const item of state.items) {
    transport = transport.plus(M(item.purchasePrice).times(item.currentValueMultiplier));
  }
  return { balance, businesses, stocks, crypto, transport, collections, realEstate, residence };
}

export { BUSINESSES };
