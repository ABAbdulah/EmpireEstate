import { Ionicons } from '@expo/vector-icons';

export type Sector = 'food' | 'transport' | 'tech' | 'industry' | 'entertainment' | 'finance';

export interface BusinessTemplate {
  id: string;
  name: string;
  sector: Sector;
  icon: keyof typeof Ionicons.glyphMap;
  baseCost: string;
  baseIncome: string;
  cycleSeconds: number;
  managerCost: string;
  unlockNetworth: string;
  maxLevel: number;
}

export const BUSINESSES: BusinessTemplate[] = [
  { id: 'lemonade',  name: 'Lemonade Stand', sector: 'food',          icon: 'cafe-outline',         baseCost: '10',          baseIncome: '0.5',     cycleSeconds: 2,    managerCost: '1000',       unlockNetworth: '0',         maxLevel: 200 },
  { id: 'foodtruck', name: 'Food Truck',     sector: 'food',          icon: 'fast-food-outline',    baseCost: '250',         baseIncome: '10',      cycleSeconds: 4,    managerCost: '25000',      unlockNetworth: '500',       maxLevel: 200 },
  { id: 'coffee',    name: 'Coffee Shop',    sector: 'food',          icon: 'cafe',                 baseCost: '5000',        baseIncome: '160',     cycleSeconds: 8,    managerCost: '500000',     unlockNetworth: '5000',      maxLevel: 200 },
  { id: 'taxi',      name: 'Taxi Company',   sector: 'transport',     icon: 'car-sport-outline',    baseCost: '50000',       baseIncome: '1400',    cycleSeconds: 15,   managerCost: '5000000',    unlockNetworth: '50000',     maxLevel: 200 },
  { id: 'it',        name: 'IT Startup',     sector: 'tech',          icon: 'desktop-outline',      baseCost: '500000',      baseIncome: '12000',   cycleSeconds: 30,   managerCost: '50000000',   unlockNetworth: '500000',    maxLevel: 200 },
  { id: 'factory',   name: 'Factory',        sector: 'industry',      icon: 'business',             baseCost: '5000000',     baseIncome: '100000',  cycleSeconds: 60,   managerCost: '500000000',  unlockNetworth: '5000000',   maxLevel: 200 },
  { id: 'cinema',    name: 'Cinema Chain',   sector: 'entertainment', icon: 'film-outline',         baseCost: '50000000',    baseIncome: '850000',  cycleSeconds: 120,  managerCost: '5e9',        unlockNetworth: '50000000',  maxLevel: 200 },
  { id: 'bank',      name: 'Private Bank',   sector: 'finance',       icon: 'wallet-outline',       baseCost: '500000000',   baseIncome: '7000000', cycleSeconds: 240,  managerCost: '5e10',       unlockNetworth: '500000000', maxLevel: 200 },
  { id: 'airline',   name: 'Airline',        sector: 'transport',     icon: 'airplane-outline',     baseCost: '5e9',         baseIncome: '6e7',     cycleSeconds: 360,  managerCost: '5e11',       unlockNetworth: '5e9',       maxLevel: 200 },
  { id: 'tech-giant',name: 'Tech Giant',     sector: 'tech',          icon: 'rocket-outline',       baseCost: '5e10',        baseIncome: '5e8',     cycleSeconds: 480,  managerCost: '5e12',       unlockNetworth: '5e10',      maxLevel: 200 },
  { id: 'oil',       name: 'Oil Conglomerate',sector: 'industry',     icon: 'flash-outline',        baseCost: '5e11',        baseIncome: '4e9',     cycleSeconds: 600,  managerCost: '5e13',       unlockNetworth: '5e11',      maxLevel: 200 },
  { id: 'space',     name: 'Space Program',  sector: 'tech',          icon: 'planet-outline',       baseCost: '5e12',        baseIncome: '3e10',    cycleSeconds: 900,  managerCost: '5e14',       unlockNetworth: '5e12',      maxLevel: 200 },
];

export const SECTOR_COLORS: Record<Sector, string> = {
  food: '#F08773',
  transport: '#F2B45A',
  tech: '#5E9D7C',
  industry: '#9B6FB0',
  entertainment: '#8B7CE0',
  finance: '#5CCFB1',
};
