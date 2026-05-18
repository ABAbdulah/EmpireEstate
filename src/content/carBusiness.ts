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
  { id: 'luxury',  label: 'Luxury, sports & leisure', examples: 'Auddi A6, TKM X-BOV, Ferarry Jet Tender, Cessna Skymatter, etc.', avgPrice: '177436', baseHourlyPerVehicle: '1400' },
  { id: 'premium', label: 'Premium vehicles & jets',  examples: 'Ferarry V60, Boieng 7S Private Jet, Ferarry Superyacht 88, etc.', avgPrice: '8313927', baseHourlyPerVehicle: '70000' },
];

export interface CarCatalogEntry {
  id: string;
  name: string;
  segment: Specialization;
  basePrice: number;
  emoji: string;
  imageUrl: string;
}

const UX = 'https://images.unsplash.com/photo-';
const Q  = '?w=500&q=80&fit=crop&auto=format';

export const CAR_CATALOG: CarCatalogEntry[] = [
  // Mass — economy hatchbacks & sedans
  { id: 'vw-golv',       name: 'Volkswagon Golv',          segment: 'mass',    basePrice:  21500, emoji: '🚙', imageUrl: `${UX}1549317661-be9034e1e56b${Q}` },
  { id: 'renolt-logon',  name: 'Renolt Logon',             segment: 'mass',    basePrice:  18900, emoji: '🚗', imageUrl: `${UX}1502877338535-766e1452684a${Q}` },
  { id: 'alfo-tonnle',   name: 'Alfo Romeus Tonnle',       segment: 'mass',    basePrice:  28400, emoji: '🚘', imageUrl: `${UX}1489824904134-891ab64532f1${Q}` },
  { id: 'toyoda-corla',  name: 'Toyoda Corla',             segment: 'mass',    basePrice:  22300, emoji: '🚖', imageUrl: `${UX}1559416523-140ddc3d238c${Q}` },
  { id: 'hondo-civica',  name: 'Hondo Civica',             segment: 'mass',    basePrice:  24800, emoji: '🚗', imageUrl: `${UX}1590362891991-f776e747a588${Q}` },
  // Luxury — premium sedans & SUVs
  { id: 'auddi-a6',      name: 'Auddi A6',                 segment: 'luxury',  basePrice: 168000, emoji: '🚘', imageUrl: `${UX}1537984822441-cff330075342${Q}` },
  { id: 'tkm-xbov',      name: 'TKM X-BOV',                segment: 'luxury',  basePrice: 195000, emoji: '🏎️', imageUrl: `${UX}1533473359331-0135ef1b58bf${Q}` },
  { id: 'alfo-julia',    name: 'Alfo Romeus Julia',        segment: 'luxury',  basePrice: 172500, emoji: '🚙', imageUrl: `${UX}1568605117036-5f7153ac2445${Q}` },
  { id: 'dmw-m8',        name: 'DMW M8 Grand Coupe',       segment: 'luxury',  basePrice: 156000, emoji: '🚘', imageUrl: `${UX}1555215695-3004980ad54e${Q}` },
  { id: 'lezus-450',     name: 'Lezus 450',                segment: 'luxury',  basePrice:  51700, emoji: '🚗', imageUrl: `${UX}1563720223809-b4b4a89e2a2b${Q}` },
  { id: 'genetic-c90',   name: 'Genetic C90',              segment: 'luxury',  basePrice: 107900, emoji: '🚙', imageUrl: `${UX}1606664515524-ed2f786a705b${Q}` },
  { id: 'mercedes-gls',  name: 'Marcedes-Meybach GLS',     segment: 'luxury',  basePrice: 130900, emoji: '🚙', imageUrl: `${UX}1552519507-da3b142c-c549${Q}` },
  // Premium supercars
  { id: 'ferarry-v60',   name: 'Ferarry V60',              segment: 'premium', basePrice: 6800000, emoji: '🏎️', imageUrl: `${UX}1580274455191-1c62238fa333${Q}` },
  { id: 'mercedes-exo',  name: 'Marcedes-Maybech Exolero', segment: 'premium', basePrice: 9200000, emoji: '🏎️', imageUrl: `${UX}1526726538690-5cbf956ae2fd${Q}` },
  { id: 'macleran-b1',   name: 'MacLeran B1',              segment: 'premium', basePrice: 7400000, emoji: '🏁', imageUrl: `${UX}1525609004556-c46c7d6cf023${Q}` },
  // Luxury boats & yachts
  { id: 'ferarry-jet',   name: 'Ferarry Jet Tender 29',    segment: 'luxury',  basePrice:  320000, emoji: '🚤', imageUrl: `${UX}1570077188670-e3a8d69ac5ff${Q}` },
  { id: 'lezus-marine',  name: 'Lezus Marine LX-500',      segment: 'luxury',  basePrice:  285000, emoji: '⛵', imageUrl: `${UX}1548540916-7e00e9f24bcf${Q}` },
  { id: 'dmw-cruiser',   name: 'DMW Lake Cruiser C6',      segment: 'luxury',  basePrice:  178000, emoji: '🛥️', imageUrl: `${UX}1534438327276-14e5300c3a48${Q}` },
  { id: 'hondo-mariner', name: 'Hondo Mariner 350',        segment: 'luxury',  basePrice:  215000, emoji: '🚤', imageUrl: `${UX}1545566810-8c2dd0dd0c1a${Q}` },
  // Premium yachts & private jets
  { id: 'boieng-7s',     name: 'Boieng 7S Private Jet',    segment: 'premium', basePrice: 12000000, emoji: '✈️', imageUrl: `${UX}1474487548417-781cb71495f3${Q}` },
  { id: 'arrbus-exec',   name: 'Arrbus A320 Executive',    segment: 'premium', basePrice:  8500000, emoji: '✈️', imageUrl: `${UX}1436491865332-7a61a109cc05${Q}` },
  { id: 'cessna-sky',    name: 'Cessna Skymatter 400',     segment: 'luxury',  basePrice:   340000, emoji: '🛩️', imageUrl: `${UX}1544636331-e26879cd4d9b${Q}` },
  { id: 'ferarry-yacht', name: 'Ferarry Superyacht 88',    segment: 'premium', basePrice: 14200000, emoji: '🛳️', imageUrl: `${UX}1567899378494-47b22a2ae96a${Q}` },
  { id: 'mbych-yacht',   name: 'Marcedes-Meybach Yacht X', segment: 'premium', basePrice:  5800000, emoji: '⛵', imageUrl: `${UX}1507525428034-b723cf961d3e${Q}` },
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
