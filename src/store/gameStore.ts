import { create } from 'zustand';
import { produce } from 'immer';
import Decimal from 'decimal.js';
import { GameState, INITIAL_STATE, ActiveBoost, CarBusiness, CarInventoryItem } from './types';
import { loadState, saveState } from './storage';
import { M, Money, ZERO } from '../lib/money';
import { businessTemplate, computePlayerLevel, levelIncomePerCycle, levelIncomePerHour, pendingCycles, pendingReward, tapBaseReward, upgradeCost } from '../game/economy';
import { BUSINESSES } from '../content/businesses';
import { STOCKS, CRYPTOS } from '../content/stocks';
import { SHOWROOM_SIZES, SERVICE_SIZES, SPECIALIZATIONS, generateUsedCarOffer, CAR_CATALOG } from '../content/carBusiness';

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

  addBoost: (boost: ActiveBoost) => void;
  payTaxes: () => boolean;

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

export function aggregateIncomePerHour(state: GameState): Money {
  const level = computePlayerLevel(M(state.balance));
  let total = ZERO;
  for (const [id, owned] of Object.entries(state.businesses)) {
    if (owned.level <= 0) continue;
    const t = businessTemplate(id);
    total = total.plus(levelIncomePerHour(t, owned.level));
  }
  for (const cb of state.carBusinesses) {
    const spec = SPECIALIZATIONS.find((s) => s.id === cb.specialization);
    if (!spec) continue;
    total = total.plus(M(spec.baseHourlyPerVehicle).times(cb.inventory.length));
  }
  total = total.times(level.globalIncomeMultiplier);
  total = total.times(new Decimal(1).plus(new Decimal(state.prestigeStars).times('0.02')));
  return total;
}

export const useGame = create<StoreState>((set, get) => ({
  state: INITIAL_STATE,
  hydrated: false,

  hydrate: async () => {
    const loaded = await loadState();
    set({ state: loaded, hydrated: true });
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
            .times(businessMult);
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

    const newBoosts = before.boosts.filter((b) => b.endsAt > nowMs);

    const newState: GameState = {
      ...before,
      businesses: newBusinesses,
      balance: M(before.balance).plus(gained).toString(),
      totalEarned: M(before.totalEarned).plus(gained).toString(),
      lastTickAt: nowMs,
      boosts: newBoosts,
      taxAccrued: M(before.taxAccrued).plus(gained.times('0.12')).toString(),
    };

    set({ state: newState });
    scheduleSave(newState);

    return { gained, bySource };
  },

  doTap: () => {
    const before = get().state;
    const playerLevel = computePlayerLevel(M(before.balance));
    const base = tapBaseReward(before.tapLevel, M(before.balance));
    const tapMult = activeMultiplier(before.boosts, 'tap_2x', Date.now());
    const reward = base.times(playerLevel.globalIncomeMultiplier).times(tapMult);

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
    const cycles = pendingCycles(t, owned.lastCollectedAt, nowMs);
    if (cycles < 1) return ZERO;
    const playerLevel = computePlayerLevel(M(before.balance));
    const prestigeMult = new Decimal(1).plus(new Decimal(before.prestigeStars).times('0.02'));
    const businessMult = activeMultiplier(before.boosts, 'business_30', nowMs) * activeMultiplier(before.boosts, 'business_100', nowMs);
    const reward = levelIncomePerCycle(t, owned.level)
      .times(cycles)
      .times(playerLevel.globalIncomeMultiplier)
      .times(prestigeMult)
      .times(businessMult);
    const next = produce(before, (draft) => {
      draft.balance = M(draft.balance).plus(reward).toString();
      draft.totalEarned = M(draft.totalEarned).plus(reward).toString();
      draft.businesses[templateId].lastCollectedAt = owned.lastCollectedAt + cycles * t.cycleSeconds * 1000;
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
    let total = ZERO;
    const updates: Record<string, { lastCollectedAt: number; addedEarned: Decimal }> = {};
    for (const [id, owned] of Object.entries(before.businesses)) {
      if (owned.level <= 0 || owned.hasManager) continue;
      const t = businessTemplate(id);
      const cycles = pendingCycles(t, owned.lastCollectedAt, nowMs);
      if (cycles < 1) continue;
      const reward = levelIncomePerCycle(t, owned.level)
        .times(cycles)
        .times(playerLevel.globalIncomeMultiplier)
        .times(prestigeMult)
        .times(businessMult);
      total = total.plus(reward);
      updates[id] = {
        lastCollectedAt: owned.lastCollectedAt + cycles * t.cycleSeconds * 1000,
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

  for (const item of state.items) {
    total = total.plus(M(item.purchasePrice).times(item.currentValueMultiplier));
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
