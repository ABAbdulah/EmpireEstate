import { Ionicons } from '@expo/vector-icons';

export type Sector = 'food' | 'transport' | 'tech' | 'industry' | 'entertainment' | 'finance' | 'health' | 'defense';

export interface BusinessTemplate {
  id: string;
  name: string;
  sector: Sector;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  baseCost: string;
  baseIncome: string;
  cycleSeconds: number;
  managerCost: string;
  unlockNetworth: string;
  maxLevel: number;
  businessType?: 'standard' | 'it_company';
}

// incomePerHour = baseIncome * (3600 / cycleSeconds)
export const BUSINESSES: BusinessTemplate[] = [
  // ─── Tier 1: Street ───────────────────────────────────────────────────────
  { id: 'lemonade',    name: 'Lemonade Stand',      sector: 'food',          color: '#F5B100', icon: 'cafe-outline',           baseCost: '10',      baseIncome: '0.05',        cycleSeconds: 2,   managerCost: '2700',      unlockNetworth: '0',     maxLevel: 200 },
  { id: 'foodtruck',   name: 'Food Truck',           sector: 'food',          color: '#F08773', icon: 'fast-food-outline',      baseCost: '250',     baseIncome: '0.3',         cycleSeconds: 4,   managerCost: '8100',      unlockNetworth: '500',   maxLevel: 200 },
  { id: 'coffee',      name: 'Coffee Shop',          sector: 'food',          color: '#C96442', icon: 'cafe',                   baseCost: '5000',    baseIncome: '4',           cycleSeconds: 8,   managerCost: '54000',     unlockNetworth: '5000',  maxLevel: 200 },
  { id: 'restaurant',  name: 'Restaurant Chain',     sector: 'food',          color: '#E8704A', icon: 'restaurant-outline',     baseCost: '25000',   baseIncome: '15',          cycleSeconds: 12,  managerCost: '100000',    unlockNetworth: '25000', maxLevel: 200 },
  // ─── Tier 2: City ─────────────────────────────────────────────────────────
  { id: 'taxi',        name: 'Taxi Company',         sector: 'transport',     color: '#F2B45A', icon: 'car-sport-outline',      baseCost: '50000',   baseIncome: '40',          cycleSeconds: 15,  managerCost: '288000',    unlockNetworth: '50000',   maxLevel: 200 },
  { id: 'clothing',    name: 'Clothing Brand',       sector: 'entertainment', color: '#D95B8A', icon: 'shirt-outline',          baseCost: '200000',  baseIncome: '100',         cycleSeconds: 20,  managerCost: '600000',    unlockNetworth: '200000',  maxLevel: 200 },
  { id: 'it',          name: 'IT Company',           sector: 'tech',          color: '#7C3AED', icon: 'desktop-outline',        baseCost: '500000',  baseIncome: '250',         cycleSeconds: 30,  managerCost: '900000',    unlockNetworth: '500000',  maxLevel: 200, businessType: 'it_company' },
  { id: 'hotel',       name: 'Hotel Chain',          sector: 'entertainment', color: '#0EA5E9', icon: 'bed-outline',            baseCost: '1800000', baseIncome: '667',         cycleSeconds: 40,  managerCost: '5400000',   unlockNetworth: '1800000', maxLevel: 200 },
  // ─── Tier 3: Industry ─────────────────────────────────────────────────────
  { id: 'factory',     name: 'Factory',              sector: 'industry',      color: '#9B6FB0', icon: 'business',               baseCost: '5000000', baseIncome: '2000',        cycleSeconds: 60,  managerCost: '3600000',   unlockNetworth: '5000000',   maxLevel: 200 },
  { id: 'shipping',    name: 'Shipping Company',     sector: 'transport',     color: '#4EABD1', icon: 'boat-outline',           baseCost: '18000000',baseIncome: '5208',        cycleSeconds: 75,  managerCost: '5400000',   unlockNetworth: '18000000',  maxLevel: 200 },
  { id: 'cinema',      name: 'Cinema Chain',         sector: 'entertainment', color: '#8B7CE0', icon: 'film-outline',           baseCost: '50000000',baseIncome: '17000',       cycleSeconds: 120, managerCost: '15000000',  unlockNetworth: '50000000',  maxLevel: 200 },
  { id: 'construction',name: 'Construction Firm',    sector: 'industry',      color: '#D97706', icon: 'construct-outline',      baseCost: '180000000',baseIncome: '43750',      cycleSeconds: 150, managerCost: '25000000',  unlockNetworth: '180000000', maxLevel: 200 },
  // ─── Tier 4: Corporate ────────────────────────────────────────────────────
  { id: 'bank',        name: 'Private Bank',         sector: 'finance',       color: '#5CCFB1', icon: 'wallet-outline',         baseCost: '500000000', baseIncome: '140000',    cycleSeconds: 240, managerCost: '63000000',  unlockNetworth: '500000000',  maxLevel: 200 },
  { id: 'media',       name: 'Media Studio',         sector: 'entertainment', color: '#F43F5E', icon: 'tv-outline',             baseCost: '1800000000',baseIncome: '416667',    cycleSeconds: 300, managerCost: '160000000', unlockNetworth: '1800000000', maxLevel: 200 },
  { id: 'pharma',      name: 'Pharma Group',         sector: 'health',        color: '#10B981', icon: 'medkit-outline',         baseCost: '1.8e11',  baseIncome: '30000000',    cycleSeconds: 540, managerCost: '1.2e10',    unlockNetworth: '1.8e11',     maxLevel: 200 },
  // ─── Tier 5: Global ───────────────────────────────────────────────────────
  { id: 'airline',     name: 'Airline',              sector: 'transport',     color: '#60A5FA', icon: 'airplane-outline',       baseCost: '5e9',     baseIncome: '1.2e6',       cycleSeconds: 360, managerCost: '360000000', unlockNetworth: '5e9',        maxLevel: 200 },
  { id: 'mining',      name: 'Mining Corp',          sector: 'industry',      color: '#78716C', icon: 'layers-outline',         baseCost: '1.8e10',  baseIncome: '3500000',     cycleSeconds: 420, managerCost: '1.2e9',     unlockNetworth: '1.8e10',     maxLevel: 200 },
  { id: 'tech-giant',  name: 'Tech Giant',           sector: 'tech',          color: '#5E9D7C', icon: 'rocket-outline',         baseCost: '5e10',    baseIncome: '1e7',         cycleSeconds: 480, managerCost: '2.25e9',    unlockNetworth: '5e10',       maxLevel: 200 },
  { id: 'hedge',       name: 'Hedge Fund',           sector: 'finance',       color: '#059669', icon: 'trending-up-outline',    baseCost: '1.8e12',  baseIncome: '200000000',   cycleSeconds: 720, managerCost: '1.2e11',    unlockNetworth: '1.8e12',     maxLevel: 200 },
  // ─── Tier 6: Empire ───────────────────────────────────────────────────────
  { id: 'oil',         name: 'Oil Conglomerate',     sector: 'industry',      color: '#DC2626', icon: 'flash-outline',          baseCost: '5e11',    baseIncome: '8e7',         cycleSeconds: 600, managerCost: '1.44e10',   unlockNetworth: '5e11',       maxLevel: 200 },
  { id: 'military',    name: 'Defense Contractor',   sector: 'defense',       color: '#475569', icon: 'shield-outline',         baseCost: '1.8e13',  baseIncome: '2000000000',  cycleSeconds: 900, managerCost: '1.2e12',    unlockNetworth: '1.8e13',     maxLevel: 200 },
  { id: 'space',       name: 'Space Program',        sector: 'tech',          color: '#6366F1', icon: 'planet-outline',         baseCost: '5e12',    baseIncome: '6e8',         cycleSeconds: 900, managerCost: '7.2e10',    unlockNetworth: '5e12',       maxLevel: 200 },
];

export const SECTOR_COLORS: Record<Sector, string> = {
  food:          '#F08773',
  transport:     '#F2B45A',
  tech:          '#5E9D7C',
  industry:      '#9B6FB0',
  entertainment: '#8B7CE0',
  finance:       '#5CCFB1',
  health:        '#10B981',
  defense:       '#475569',
};

export interface MergerRequirement {
  businessId: string;
  minLevel: number;
  label: string;
}

export interface MergerRecipe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requirements: MergerRequirement[];
  investmentCost: string;
  incomeBonus: number; // fraction e.g. 0.10 = +10% all income
  bonusLabel: string;
}

export const MERGER_RECIPES: MergerRecipe[] = [
  {
    id: 'food_empire',
    name: 'Street Food Empire',
    emoji: '🍔',
    description: 'Combine your food businesses into a nationwide hospitality group.',
    requirements: [
      { businessId: 'lemonade',   minLevel: 50,  label: 'Lemonade Stand Lv 50+' },
      { businessId: 'foodtruck',  minLevel: 50,  label: 'Food Truck Lv 50+' },
      { businessId: 'coffee',     minLevel: 50,  label: 'Coffee Shop Lv 50+' },
      { businessId: 'restaurant', minLevel: 30,  label: 'Restaurant Chain Lv 30+' },
    ],
    investmentCost: '10000000',
    incomeBonus: 0.10,
    bonusLabel: '+10% all income',
  },
  {
    id: 'transport_net',
    name: 'Transport Conglomerate',
    emoji: '🚀',
    description: 'Unite ground, sea, and air transport into one global network.',
    requirements: [
      { businessId: 'taxi',     minLevel: 50, label: 'Taxi Company Lv 50+' },
      { businessId: 'shipping', minLevel: 30, label: 'Shipping Company Lv 30+' },
      { businessId: 'airline',  minLevel: 20, label: 'Airline Lv 20+' },
    ],
    investmentCost: '5000000000',
    incomeBonus: 0.15,
    bonusLabel: '+15% all income',
  },
  {
    id: 'digital_empire',
    name: 'Digital Empire',
    emoji: '💻',
    description: 'Merge your tech businesses to dominate the digital economy.',
    requirements: [
      { businessId: 'it',        minLevel: 50, label: 'IT Company Lv 50+' },
      { businessId: 'tech-giant',minLevel: 30, label: 'Tech Giant Lv 30+' },
    ],
    investmentCost: '100000000000',
    incomeBonus: 0.25,
    bonusLabel: '+25% all income',
  },
  {
    id: 'industrial_giant',
    name: 'Industrial Giant',
    emoji: '🏭',
    description: 'Control manufacturing, construction and mining under one roof.',
    requirements: [
      { businessId: 'factory',      minLevel: 50, label: 'Factory Lv 50+' },
      { businessId: 'construction', minLevel: 30, label: 'Construction Firm Lv 30+' },
      { businessId: 'mining',       minLevel: 20, label: 'Mining Corp Lv 20+' },
    ],
    investmentCost: '50000000000',
    incomeBonus: 0.20,
    bonusLabel: '+20% all income',
  },
  {
    id: 'finance_lord',
    name: 'Finance Lord',
    emoji: '🏦',
    description: 'Control global capital markets through your banking empire.',
    requirements: [
      { businessId: 'bank',  minLevel: 50, label: 'Private Bank Lv 50+' },
      { businessId: 'hedge', minLevel: 30, label: 'Hedge Fund Lv 30+' },
    ],
    investmentCost: '1000000000000',
    incomeBonus: 0.30,
    bonusLabel: '+30% all income',
  },
];

// IT company employee definitions
export interface ItEmployeeType {
  type: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  levelStart: number;
  levelEnd: number;
  wagePerHr: number;
  color: string;
}

export const IT_EMPLOYEES: ItEmployeeType[] = [
  { type: 'junior',      label: 'Junior Developers', icon: 'code-slash-outline',    levelStart: 1,   levelEnd: 25,  wagePerHr: 50,  color: '#60A5FA' },
  { type: 'middle',      label: 'Middle Developers', icon: 'code-outline',           levelStart: 26,  levelEnd: 50,  wagePerHr: 80,  color: '#818CF8' },
  { type: 'senior',      label: 'Senior Developers', icon: 'trophy-outline',         levelStart: 51,  levelEnd: 80,  wagePerHr: 120, color: '#F59E0B' },
  { type: 'designer',    label: 'Designers',          icon: 'color-palette-outline',  levelStart: 81,  levelEnd: 110, wagePerHr: 90,  color: '#F43F5E' },
  { type: 'team_leader', label: 'Team Leaders',       icon: 'people-outline',         levelStart: 111, levelEnd: 150, wagePerHr: 150, color: '#10B981' },
  { type: 'tester',      label: 'Testers',            icon: 'options-outline',        levelStart: 151, levelEnd: 200, wagePerHr: 60,  color: '#8B7CE0' },
];

export function getItEmployeeCounts(level: number): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const emp of IT_EMPLOYEES) {
    counts[emp.type] = Math.max(0, Math.min(level - emp.levelStart + 1, emp.levelEnd - emp.levelStart + 1));
    if (level < emp.levelStart) counts[emp.type] = 0;
  }
  return counts;
}

export function getItTotalWagePerHr(level: number): number {
  const counts = getItEmployeeCounts(level);
  let total = 0;
  for (const emp of IT_EMPLOYEES) {
    total += (counts[emp.type] ?? 0) * emp.wagePerHr;
  }
  return total;
}

const IT_PROJECT_NAMES = [
  'Website Redesign', 'Mobile App MVP', 'API Integration', 'E-commerce Platform',
  'CRM System', 'Analytics Dashboard', 'Cloud Migration', 'AI Chatbot',
  'ERP Implementation', 'Cybersecurity Audit', 'DevOps Pipeline', 'Data Warehouse',
];

export function getItProjects(level: number): { name: string; value: number }[] {
  if (level === 0) return [];
  const count = Math.min(Math.floor(level / 8) + 1, IT_PROJECT_NAMES.length);
  return IT_PROJECT_NAMES.slice(0, count).map((name, i) => ({
    name,
    value: Math.round(30000 * Math.pow(2.2, i)),
  }));
}
