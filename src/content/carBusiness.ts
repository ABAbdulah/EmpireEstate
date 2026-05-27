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

export type VehicleType = 'car' | 'boat' | 'plane' | 'yacht';

export interface CarCatalogEntry {
  id: string;
  name: string;
  segment: Specialization;
  vehicleType: VehicleType;
  basePrice: number;
  emoji: string;
  imageUrl: string;
}

// Generates clean, accurate AI car images via Pollinations.ai.
// No API key needed. Same prompt+seed → same image (cached on their CDN).
function aiImage(prompt: string, seed: number): string {
  const fullPrompt = `${prompt}, side profile view, white background, photorealistic product shot`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=400&height=260&nologo=true&seed=${seed}`;
}

export const CAR_CATALOG: CarCatalogEntry[] = [
  // Mass — economy hatchbacks & sedans (10 cars)
  { id: 'vw-golv',          name: 'Volkswagon Golv',         segment: 'mass',    vehicleType: 'car',   basePrice:  21500,    emoji: '🚙', imageUrl: aiImage('compact silver hatchback car, modern european design', 101) },
  { id: 'renolt-logon',     name: 'Renolt Logon',            segment: 'mass',    vehicleType: 'car',   basePrice:  18900,    emoji: '🚗', imageUrl: aiImage('budget white sedan car, simple economy car', 102) },
  { id: 'alfo-tonnle',      name: 'Alfo Romeus Tonnle',      segment: 'mass',    vehicleType: 'car',   basePrice:  28400,    emoji: '🚘', imageUrl: aiImage('compact red italian crossover SUV', 103) },
  { id: 'toyoda-corla',     name: 'Toyoda Corla',            segment: 'mass',    vehicleType: 'car',   basePrice:  22300,    emoji: '🚖', imageUrl: aiImage('silver japanese compact sedan, reliable family car', 104) },
  { id: 'hondo-civica',     name: 'Hondo Civica',            segment: 'mass',    vehicleType: 'car',   basePrice:  24800,    emoji: '🚗', imageUrl: aiImage('blue compact japanese sedan, sporty hatchback', 105) },
  { id: 'nezzan-altimo',    name: 'Nezzan Altimo',           segment: 'mass',    vehicleType: 'car',   basePrice:  26500,    emoji: '🚗', imageUrl: aiImage('grey japanese mid-size sedan, sporty family car', 106) },
  { id: 'masda-3sx',        name: 'Masda 3SX',               segment: 'mass',    vehicleType: 'car',   basePrice:  23800,    emoji: '🚙', imageUrl: aiImage('red japanese compact hatchback, modern design', 107) },
  { id: 'hyandai-elontra',  name: 'Hyandai Elontra',         segment: 'mass',    vehicleType: 'car',   basePrice:  20900,    emoji: '🚗', imageUrl: aiImage('blue korean compact sedan, modern design', 108) },
  { id: 'chevrolat-cruzo',  name: 'Chevrolat Cruzo',         segment: 'mass',    vehicleType: 'car',   basePrice:  19500,    emoji: '🚘', imageUrl: aiImage('white american compact sedan, family economy car', 109) },
  { id: 'forde-fucos',      name: 'Forde Fucos',             segment: 'mass',    vehicleType: 'car',   basePrice:  21900,    emoji: '🚙', imageUrl: aiImage('silver american compact hatchback, sporty design', 110) },

  // Luxury — premium sedans, SUVs & coupes (10 cars)
  { id: 'auddi-a6',         name: 'Auddi A6',                segment: 'luxury',  vehicleType: 'car',   basePrice: 168000,    emoji: '🚘', imageUrl: aiImage('silver german luxury executive sedan', 201) },
  { id: 'tkm-xbov',         name: 'TKM X-BOV',               segment: 'luxury',  vehicleType: 'car',   basePrice: 195000,    emoji: '🏎️', imageUrl: aiImage('black luxury sports sedan, aggressive design', 202) },
  { id: 'alfo-julia',       name: 'Alfo Romeus Julia',       segment: 'luxury',  vehicleType: 'car',   basePrice: 172500,    emoji: '🚙', imageUrl: aiImage('red italian luxury sport sedan', 203) },
  { id: 'dmw-m8',           name: 'DMW M8 Grand Coupe',      segment: 'luxury',  vehicleType: 'car',   basePrice: 156000,    emoji: '🚘', imageUrl: aiImage('black german grand coupe luxury sports car', 204) },
  { id: 'lezus-450',        name: 'Lezus 450',               segment: 'luxury',  vehicleType: 'car',   basePrice:  51700,    emoji: '🚗', imageUrl: aiImage('silver japanese luxury sedan, refined design', 205) },
  { id: 'genetic-c90',      name: 'Genetic C90',             segment: 'luxury',  vehicleType: 'car',   basePrice: 107900,    emoji: '🚙', imageUrl: aiImage('white luxury sedan, korean premium car', 206) },
  { id: 'mercedes-gls',     name: 'Marcedes-Meybach GLS',    segment: 'luxury',  vehicleType: 'car',   basePrice: 130900,    emoji: '🚙', imageUrl: aiImage('black german luxury full-size SUV', 207) },
  { id: 'porshe-cayman',    name: 'Porshe Cayman',           segment: 'luxury',  vehicleType: 'car',   basePrice: 115000,    emoji: '🏎️', imageUrl: aiImage('yellow german mid-engine sports coupe', 208) },
  { id: 'jaguar-xfr',       name: 'Jaguar XFR',              segment: 'luxury',  vehicleType: 'car',   basePrice:  92000,    emoji: '🚘', imageUrl: aiImage('british luxury sport sedan, elegant design', 209) },
  { id: 'volvio-s90',       name: 'Volvio S90',              segment: 'luxury',  vehicleType: 'car',   basePrice:  78000,    emoji: '🚗', imageUrl: aiImage('swedish luxury executive sedan, scandinavian design', 210) },

  // Premium — supercars & hypercars (8 cars)
  { id: 'ferarry-v60',      name: 'Ferarry V60',             segment: 'premium', vehicleType: 'car',   basePrice: 6800000,   emoji: '🏎️', imageUrl: aiImage('red italian supercar, exotic sports car', 301) },
  { id: 'mercedes-exo',     name: 'Marcedes-Maybech Exolero', segment: 'premium', vehicleType: 'car',   basePrice: 9200000,  emoji: '🏎️', imageUrl: aiImage('silver german hypercar, exotic supercar', 302) },
  { id: 'macleran-b1',      name: 'MacLeran B1',             segment: 'premium', vehicleType: 'car',   basePrice: 7400000,   emoji: '🏁', imageUrl: aiImage('orange british supercar, mid-engine exotic', 303) },
  { id: 'lambrogini-uros',  name: 'Lambrogini Uros',         segment: 'premium', vehicleType: 'car',   basePrice: 4500000,   emoji: '🏎️', imageUrl: aiImage('yellow italian luxury supercar SUV', 304) },
  { id: 'lambrogini-huri',  name: 'Lambrogini Hurican',      segment: 'premium', vehicleType: 'car',   basePrice: 5800000,   emoji: '🏎️', imageUrl: aiImage('green italian supercar, V10 mid-engine exotic', 305) },
  { id: 'bugatii-chrion',   name: 'Bugatii Chrion',          segment: 'premium', vehicleType: 'car',   basePrice: 12500000,  emoji: '🏁', imageUrl: aiImage('blue and black french hypercar, ultra exclusive', 306) },
  { id: 'aston-vantash',    name: 'Aston Martan Vantash',    segment: 'premium', vehicleType: 'car',   basePrice: 3800000,   emoji: '🏎️', imageUrl: aiImage('british grey grand tourer luxury sports car', 307) },
  { id: 'koenig-jetska',    name: 'Koenig Jetska',           segment: 'premium', vehicleType: 'car',   basePrice: 11000000,  emoji: '🏁', imageUrl: aiImage('swedish hypercar, lightweight track-focused exotic', 308) },
  // Luxury boats & yachts
  { id: 'ferarry-jet',   name: 'Ferarry Jet Tender 29',    segment: 'luxury',  vehicleType: 'boat',  basePrice:  320000,   emoji: '🚤', imageUrl: aiImage('luxury speedboat tender, red and white sport boat', 401) },
  { id: 'lezus-marine',  name: 'Lezus Marine LX-500',      segment: 'luxury',  vehicleType: 'boat',  basePrice:  285000,   emoji: '⛵', imageUrl: aiImage('white luxury cabin cruiser boat', 402) },
  { id: 'dmw-cruiser',   name: 'DMW Lake Cruiser C6',      segment: 'luxury',  vehicleType: 'boat',  basePrice:  178000,   emoji: '🛥️', imageUrl: aiImage('white motor yacht cruiser boat', 403) },
  { id: 'hondo-mariner', name: 'Hondo Mariner 350',        segment: 'luxury',  vehicleType: 'boat',  basePrice:  215000,   emoji: '🚤', imageUrl: aiImage('white luxury speedboat, sporty marine craft', 404) },
  // Premium yachts & private jets
  { id: 'boieng-7s',     name: 'Boieng 7S Private Jet',    segment: 'premium', vehicleType: 'plane', basePrice: 12000000,  emoji: '✈️', imageUrl: aiImage('white private business jet airplane', 501) },
  { id: 'arrbus-exec',   name: 'Arrbus A320 Executive',    segment: 'premium', vehicleType: 'plane', basePrice:  8500000,  emoji: '✈️', imageUrl: aiImage('executive corporate jet airplane', 502) },
  { id: 'cessna-sky',    name: 'Cessna Skymatter 400',     segment: 'luxury',  vehicleType: 'plane', basePrice:   340000,  emoji: '🛩️', imageUrl: aiImage('small white private propeller airplane', 503) },
  { id: 'ferarry-yacht', name: 'Ferarry Superyacht 88',    segment: 'premium', vehicleType: 'yacht', basePrice: 14200000,  emoji: '🛳️', imageUrl: aiImage('large luxury white superyacht megayacht', 504) },
  { id: 'mbych-yacht',   name: 'Marcedes-Meybach Yacht X', segment: 'premium', vehicleType: 'yacht', basePrice:  5800000,  emoji: '⛵', imageUrl: aiImage('white luxury motor yacht with sleek design', 505) },
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
  const pool = CAR_CATALOG.filter((c) => c.segment === segment && c.vehicleType === 'car');
  if (pool.length === 0) return null;
  const car = pool[seed % pool.length];
  const condition = 0.3 + ((seed * 7919) % 1000) / 1428.5; // 0.3..1.0
  const discount = 0.55 + condition * 0.45; // worse condition = bigger discount
  const askPrice = Math.round(car.basePrice * discount);
  return { ...car, condition, askPrice };
}
