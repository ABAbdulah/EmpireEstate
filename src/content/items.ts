export type ItemCategory = 'garage' | 'hangar' | 'harbor';

export interface ItemTemplate {
  id: string;
  category: ItemCategory;
  name: string;
  tier: number;
  price: string;
  appreciationPerHour: number;
  emoji: string;
}

export const ITEMS: ItemTemplate[] = [
  // Garage
  { id: 'c1', category: 'garage', name: 'City Hatch',       tier: 1, price: '12000',     appreciationPerHour: 0.00001, emoji: '🚗' },
  { id: 'c2', category: 'garage', name: 'Sport Coupe',      tier: 2, price: '85000',     appreciationPerHour: 0.00005, emoji: '🏎️' },
  { id: 'c3', category: 'garage', name: 'Supercar',         tier: 3, price: '450000',    appreciationPerHour: 0.0001,  emoji: '🚙' },
  { id: 'c4', category: 'garage', name: 'Hypercar',         tier: 4, price: '2800000',   appreciationPerHour: 0.0002,  emoji: '🏁' },
  { id: 'c5', category: 'garage', name: 'Vintage Roadster', tier: 5, price: '12000000',  appreciationPerHour: 0.0003,  emoji: '🚓' },
  // Hangar
  { id: 'a1', category: 'hangar', name: 'Cessna 172',       tier: 1, price: '350000',    appreciationPerHour: 0.00002, emoji: '🛩️' },
  { id: 'a2', category: 'hangar', name: 'Private Jet',      tier: 2, price: '4500000',   appreciationPerHour: 0.00008, emoji: '✈️' },
  { id: 'a3', category: 'hangar', name: 'Heavy Jet',        tier: 3, price: '28000000',  appreciationPerHour: 0.00012, emoji: '🛫' },
  { id: 'a4', category: 'hangar', name: 'Custom Airliner',  tier: 4, price: '140000000', appreciationPerHour: 0.00018, emoji: '🛬' },
  // Harbor
  { id: 'y1', category: 'harbor', name: 'Speedboat',        tier: 1, price: '120000',    appreciationPerHour: 0.00001, emoji: '🚤' },
  { id: 'y2', category: 'harbor', name: 'Yacht',            tier: 2, price: '3200000',   appreciationPerHour: 0.00006, emoji: '⛵' },
  { id: 'y3', category: 'harbor', name: 'Mega Yacht',       tier: 3, price: '45000000',  appreciationPerHour: 0.00015, emoji: '🛥️' },
  { id: 'y4', category: 'harbor', name: 'Superyacht',       tier: 4, price: '280000000', appreciationPerHour: 0.00022, emoji: '🚢' },
];

export interface CollectionTemplate {
  id: string;
  name: string;
  totalItems: number;
  emoji: string;
  passiveBonus: string;
}

export const COLLECTIONS: CollectionTemplate[] = [
  { id: 'coins',    name: 'Coins',        totalItems: 20, emoji: '🪙', passiveBonus: '+5% business income' },
  { id: 'paint',    name: 'Paintings',    totalItems: 25, emoji: '🎨', passiveBonus: '+5% stock dividends' },
  { id: 'unique',   name: 'Unique items', totalItems:  5, emoji: '🔷', passiveBonus: '+10% tap earnings' },
  { id: 'retrocar', name: 'Retro cars',   totalItems: 20, emoji: '🚘', passiveBonus: '+3% global income' },
  { id: 'crowns',   name: 'Crowns',       totalItems:  8, emoji: '👑', passiveBonus: '+2% prestige stars' },
  { id: 'cards',    name: 'Trading cards',totalItems: 30, emoji: '🃏', passiveBonus: '+5% crypto yield' },
];
