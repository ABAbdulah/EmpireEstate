// Car-business content. Brand names are intentionally altered for copyright safety.

export type ShowroomType = 'used' | 'new';

export interface ShowroomSize {
  id: 'small' | 'mid' | 'large';
  label: string;
  capacity: number;
  costUsed: string;
  costNew: string;
}

export const SHOWROOM_SIZES: ShowroomSize[] = [
  { id: 'small', label: 'Small showroom',   capacity:  5, costUsed: '20000',   costNew: '60000'  },
  { id: 'mid',   label: 'Mid-size showroom', capacity: 10, costUsed: '80000',   costNew: '240000' },
  { id: 'large', label: 'Large showroom',   capacity: 40, costUsed: '1000000', costNew: '3500000' },
];

export interface ServiceSize {
  id: 'small' | 'mid' | 'large';
  label: string;
  capacity: number;
  cost: string;
}

export const SERVICE_SIZES: ServiceSize[] = [
  { id: 'small', label: 'Small car service',   capacity:  5, cost: '30000'   },
  { id: 'mid',   label: 'Mid-size car service', capacity: 10, cost: '120000'  },
  { id: 'large', label: 'Large car service',   capacity: 40, cost: '1300000' },
];

export type Specialization = 'mass' | 'luxury' | 'premium';

export interface SpecializationTemplate {
  id: Specialization;
  label: string;
  examples: string;
  avgPrice: string;
  baseHourlyPerVehicle: string;
}

export const SPECIALIZATIONS: SpecializationTemplate[] = [
  { id: 'mass',    label: 'Mass-use vehicles',     examples: 'Volkswagon Golv, Renolt Logon, Alfo Romeus Tonnle, etc.', avgPrice: '22946',  baseHourlyPerVehicle: '180' },
  { id: 'luxury',  label: 'Luxury and sports cars', examples: 'Auddi A6, TKM X-BOV, Alfo Romeus Julia Quatrifogilo, etc.', avgPrice: '177436', baseHourlyPerVehicle: '1400' },
  { id: 'premium', label: 'Premium vehicles',      examples: 'Ferarry V60, Marcedes-Maybech Exolero, MacLeran B1, etc.', avgPrice: '8313927', baseHourlyPerVehicle: '70000' },
];

export interface CarCatalogEntry {
  id: string;
  name: string;
  segment: Specialization;
  basePrice: number;
  emoji: string;
}

export const CAR_CATALOG: CarCatalogEntry[] = [
  // Mass
  { id: 'vw-golv',       name: 'Volkswagon Golv',     segment: 'mass',    basePrice:  21500, emoji: '🚙' },
  { id: 'renolt-logon',  name: 'Renolt Logon',        segment: 'mass',    basePrice:  18900, emoji: '🚗' },
  { id: 'alfo-tonnle',   name: 'Alfo Romeus Tonnle',  segment: 'mass',    basePrice:  28400, emoji: '🚘' },
  { id: 'toyoda-corla',  name: 'Toyoda Corla',        segment: 'mass',    basePrice:  22300, emoji: '🚖' },
  { id: 'hondo-civica',  name: 'Hondo Civica',        segment: 'mass',    basePrice:  24800, emoji: '🚗' },
  // Luxury
  { id: 'auddi-a6',      name: 'Auddi A6',            segment: 'luxury',  basePrice: 168000, emoji: '🚘' },
  { id: 'tkm-xbov',      name: 'TKM X-BOV',           segment: 'luxury',  basePrice: 195000, emoji: '🏎️' },
  { id: 'alfo-julia',    name: 'Alfo Romeus Julia',   segment: 'luxury',  basePrice: 172500, emoji: '🚙' },
  { id: 'dmw-m8',        name: 'DMW M8 Grand Coupe',  segment: 'luxury',  basePrice: 156000, emoji: '🚘' },
  { id: 'lezus-450',     name: 'Lezus 450',           segment: 'luxury',  basePrice:  51700, emoji: '🚗' },
  { id: 'genetic-c90',   name: 'Genetic C90',         segment: 'luxury',  basePrice: 107900, emoji: '🚙' },
  { id: 'mercedes-gls',  name: 'Marcedes-Meybach GLS',segment: 'luxury',  basePrice: 130900, emoji: '🚙' },
  // Premium
  { id: 'ferarry-v60',   name: 'Ferarry V60',         segment: 'premium', basePrice: 6800000, emoji: '🏎️' },
  { id: 'mercedes-exo',  name: 'Marcedes-Maybech Exolero', segment: 'premium', basePrice: 9200000, emoji: '🏎️' },
  { id: 'macleran-b1',   name: 'MacLeran B1',         segment: 'premium', basePrice: 7400000, emoji: '🏁' },
];

export type SkillKey = 'engine' | 'transmission' | 'chassis' | 'body';

export interface SkillTemplate {
  id: SkillKey;
  label: string;
  icon: 'flash-outline' | 'cog-outline' | 'car-sport-outline' | 'shield-outline';
  description: string;
}

export const SKILLS: SkillTemplate[] = [
  { id: 'engine',       label: 'Engine',       icon: 'flash-outline',     description: 'Higher accuracy on engine condition prediction' },
  { id: 'transmission', label: 'Transmission', icon: 'cog-outline',       description: 'Better transmission repairs' },
  { id: 'chassis',      label: 'Chassis',      icon: 'car-sport-outline', description: 'Improved chassis diagnostics' },
  { id: 'body',         label: 'Car body',     icon: 'shield-outline',    description: 'Faster bodywork & paint jobs' },
];

export function generateUsedCarOffer(segment: Specialization, seed: number) {
  const pool = CAR_CATALOG.filter((c) => c.segment === segment);
  if (pool.length === 0) return null;
  const car = pool[seed % pool.length];
  const condition = 0.3 + ((seed * 7919) % 1000) / 1428.5; // 0.3..1.0
  const discount = 0.55 + condition * 0.45; // worse condition = bigger discount
  const askPrice = Math.round(car.basePrice * discount);
  return { ...car, condition, askPrice };
}
