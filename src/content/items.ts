export type ItemCategory = 'garage' | 'hangar' | 'harbor';
export type CollectionBonusType = 'business_income' | 'global_income' | 'tap_earnings';

export interface ItemTemplate {
  id: string;
  category: ItemCategory;
  name: string;
  tier: number;
  price: string;
  appreciationPerHour: number;
  emoji: string;
  collectionId: string;
}

export const ITEMS: ItemTemplate[] = [
  // Garage — Entry Fleet (coins)
  { id: 'c1', category: 'garage', name: 'City Hatch',       tier: 1, price: '12000',     appreciationPerHour: 0.00001, emoji: '🚗', collectionId: 'coins'   },
  { id: 'c2', category: 'garage', name: 'Sport Coupe',      tier: 2, price: '85000',     appreciationPerHour: 0.00005, emoji: '🏎️', collectionId: 'coins'   },
  // Garage — Sports Fleet (retrocar)
  { id: 'c3', category: 'garage', name: 'Supercar',         tier: 3, price: '450000',    appreciationPerHour: 0.0001,  emoji: '🚙', collectionId: 'retrocar' },
  { id: 'c4', category: 'garage', name: 'Hypercar',         tier: 4, price: '2800000',   appreciationPerHour: 0.0002,  emoji: '🏁', collectionId: 'retrocar' },
  { id: 'c5', category: 'garage', name: 'Vintage Roadster', tier: 5, price: '12000000',  appreciationPerHour: 0.0003,  emoji: '🚓', collectionId: 'retrocar' },
  // Hangar — Sky Starters (paint)
  { id: 'a1', category: 'hangar', name: 'Cessna 172',       tier: 1, price: '350000',    appreciationPerHour: 0.00002, emoji: '🛩️', collectionId: 'paint'   },
  { id: 'a2', category: 'hangar', name: 'Private Jet',      tier: 2, price: '4500000',   appreciationPerHour: 0.00008, emoji: '✈️', collectionId: 'paint'   },
  // Hangar — Heavy Aviation (crowns)
  { id: 'a3', category: 'hangar', name: 'Heavy Jet',        tier: 3, price: '28000000',  appreciationPerHour: 0.00012, emoji: '🛫', collectionId: 'crowns'  },
  { id: 'a4', category: 'hangar', name: 'Custom Airliner',  tier: 4, price: '140000000', appreciationPerHour: 0.00018, emoji: '🛬', collectionId: 'crowns'  },
  // Harbor — Sea Starters (cards)
  { id: 'y1', category: 'harbor', name: 'Speedboat',        tier: 1, price: '120000',    appreciationPerHour: 0.00001, emoji: '🚤', collectionId: 'cards'   },
  { id: 'y2', category: 'harbor', name: 'Yacht',            tier: 2, price: '3200000',   appreciationPerHour: 0.00006, emoji: '⛵', collectionId: 'cards'   },
  // Harbor — Mega Fleet (unique)
  { id: 'y3', category: 'harbor', name: 'Mega Yacht',       tier: 3, price: '45000000',  appreciationPerHour: 0.00015, emoji: '🛥️', collectionId: 'unique'  },
  { id: 'y4', category: 'harbor', name: 'Superyacht',       tier: 4, price: '280000000', appreciationPerHour: 0.00022, emoji: '🚢', collectionId: 'unique'  },
];

export interface CollectionTemplate {
  id: string;
  name: string;
  totalItems: number;
  emoji: string;
  passiveBonus: string;
  bonusType: CollectionBonusType;
  bonusValue: number;
}

export const COLLECTIONS: CollectionTemplate[] = [
  { id: 'coins',   name: 'Entry Fleet',    totalItems: 2, emoji: '🪙', passiveBonus: '+5% business income', bonusType: 'business_income', bonusValue: 0.05 },
  { id: 'retrocar',name: 'Sports Fleet',   totalItems: 3, emoji: '🚘', passiveBonus: '+3% global income',   bonusType: 'global_income',   bonusValue: 0.03 },
  { id: 'paint',   name: 'Sky Starters',   totalItems: 2, emoji: '🎨', passiveBonus: '+5% tap earnings',    bonusType: 'tap_earnings',    bonusValue: 0.05 },
  { id: 'crowns',  name: 'Heavy Aviation', totalItems: 2, emoji: '👑', passiveBonus: '+3% global income',   bonusType: 'global_income',   bonusValue: 0.03 },
  { id: 'cards',   name: 'Sea Starters',   totalItems: 2, emoji: '🃏', passiveBonus: '+5% tap earnings',    bonusType: 'tap_earnings',    bonusValue: 0.05 },
  { id: 'unique',  name: 'Mega Fleet',     totalItems: 2, emoji: '🔷', passiveBonus: '+10% global income',  bonusType: 'global_income',   bonusValue: 0.10 },
];

export function computeCollectionMultipliers(collections: Record<string, string[]>): {
  businessIncomeMult: number;
  globalIncomeMult: number;
  tapEarningsMult: number;
} {
  let businessIncomeMult = 1;
  let globalIncomeMult = 1;
  let tapEarningsMult = 1;
  for (const col of COLLECTIONS) {
    const owned = collections[col.id]?.length ?? 0;
    if (owned >= col.totalItems) {
      if (col.bonusType === 'business_income') businessIncomeMult *= (1 + col.bonusValue);
      else if (col.bonusType === 'global_income') globalIncomeMult *= (1 + col.bonusValue);
      else if (col.bonusType === 'tap_earnings') tapEarningsMult *= (1 + col.bonusValue);
    }
  }
  return { businessIncomeMult, globalIncomeMult, tapEarningsMult };
}
