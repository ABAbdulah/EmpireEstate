import { Ionicons } from '@expo/vector-icons';

export type Sector = 'food' | 'transport' | 'tech' | 'industry' | 'entertainment' | 'finance';

export interface BusinessTemplate {
  id: string;
  name: string;
  sector: Sector;
  icon: keyof typeof Ionicons.glyphMap;
  baseCost: string;
  baseIncome: string;       // per cycle, level 1
  cycleSeconds: number;
  managerCost: string;
  unlockNetworth: string;
  maxLevel: number;
}

// Target hourly income at Lv 1 (small business → high tier):
// Lemonade $90/hr · Food Truck $270/hr · Coffee $1.8k · Taxi $9.6k · IT $30k · Factory $120k · Cinema $510k · Bank $2.1M · Airline $12M · Tech Giant $75M · Oil $480M · Space $2.4B
export const BUSINESSES: BusinessTemplate[] = [
  { id: 'lemonade',  name: 'Lemonade Stand',     sector: 'food',          icon: 'cafe-outline',         baseCost: '10',         baseIncome: '0.05',  cycleSeconds: 2,    managerCost: '2700',       unlockNetworth: '0',         maxLevel: 200 },
  { id: 'foodtruck', name: 'Food Truck',         sector: 'food',          icon: 'fast-food-outline',    baseCost: '250',        baseIncome: '0.3',   cycleSeconds: 4,    managerCost: '8100',       unlockNetworth: '500',       maxLevel: 200 },
  { id: 'coffee',    name: 'Coffee Shop',        sector: 'food',          icon: 'cafe',                 baseCost: '5000',       baseIncome: '4',     cycleSeconds: 8,    managerCost: '54000',      unlockNetworth: '5000',      maxLevel: 200 },
  { id: 'taxi',      name: 'Taxi Company',       sector: 'transport',     icon: 'car-sport-outline',    baseCost: '50000',      baseIncome: '40',    cycleSeconds: 15,   managerCost: '288000',     unlockNetworth: '50000',     maxLevel: 200 },
  { id: 'it',        name: 'IT Startup',         sector: 'tech',          icon: 'desktop-outline',      baseCost: '500000',     baseIncome: '250',   cycleSeconds: 30,   managerCost: '900000',     unlockNetworth: '500000',    maxLevel: 200 },
  { id: 'factory',   name: 'Factory',            sector: 'industry',      icon: 'business',             baseCost: '5000000',    baseIncome: '2000',  cycleSeconds: 60,   managerCost: '3600000',    unlockNetworth: '5000000',   maxLevel: 200 },
  { id: 'cinema',    name: 'Cinema Chain',       sector: 'entertainment', icon: 'film-outline',         baseCost: '50000000',   baseIncome: '17000', cycleSeconds: 120,  managerCost: '15000000',   unlockNetworth: '50000000',  maxLevel: 200 },
  { id: 'bank',      name: 'Private Bank',       sector: 'finance',       icon: 'wallet-outline',       baseCost: '500000000',  baseIncome: '140000',cycleSeconds: 240,  managerCost: '63000000',   unlockNetworth: '500000000', maxLevel: 200 },
  { id: 'airline',   name: 'Airline',            sector: 'transport',     icon: 'airplane-outline',     baseCost: '5e9',        baseIncome: '1.2e6', cycleSeconds: 360,  managerCost: '360000000',  unlockNetworth: '5e9',       maxLevel: 200 },
  { id: 'tech-giant',name: 'Tech Giant',         sector: 'tech',          icon: 'rocket-outline',       baseCost: '5e10',       baseIncome: '1e7',   cycleSeconds: 480,  managerCost: '2.25e9',     unlockNetworth: '5e10',      maxLevel: 200 },
  { id: 'oil',       name: 'Oil Conglomerate',   sector: 'industry',      icon: 'flash-outline',        baseCost: '5e11',       baseIncome: '8e7',   cycleSeconds: 600,  managerCost: '1.44e10',    unlockNetworth: '5e11',      maxLevel: 200 },
  { id: 'space',     name: 'Space Program',      sector: 'tech',          icon: 'planet-outline',       baseCost: '5e12',       baseIncome: '6e8',   cycleSeconds: 900,  managerCost: '7.2e10',     unlockNetworth: '5e12',      maxLevel: 200 },
];

export const SECTOR_COLORS: Record<Sector, string> = {
  food: '#F08773',
  transport: '#F2B45A',
  tech: '#5E9D7C',
  industry: '#9B6FB0',
  entertainment: '#8B7CE0',
  finance: '#5CCFB1',
};
