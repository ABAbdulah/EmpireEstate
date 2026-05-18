export type PropertyType = 'studio' | 'house' | 'apartment' | 'villa' | 'farmhouse' | 'condo' | 'penthouse' | 'building' | 'mansion' | 'island';

export interface PropertyUpgrade {
  id: string;
  label: string;
  icon: string;
  costFraction: number; // fraction of purchase price
  valueBoost: number;   // fractional increase to market value
  rentBoost: number;    // fractional increase to rent/hr
}

export interface PropertyTemplate {
  id: string;
  type: PropertyType;
  name: string;
  city: string;
  country: string;
  price: number;
  rentPerHour: number;
  unlockNetworth: number;
  imageUrl: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  salesTaxRate: number; // fraction, e.g. 0.12
}

export const PROPERTY_UPGRADES: PropertyUpgrade[] = [
  { id: 'paint',    label: 'Renovation',    icon: 'color-wand-outline',       costFraction: 0.04, valueBoost: 0.05, rentBoost: 0.05 },
  { id: 'furnish',  label: 'Furnishings',   icon: 'bed-outline',              costFraction: 0.07, valueBoost: 0.08, rentBoost: 0.09 },
  { id: 'solar',    label: 'Solar Panels',  icon: 'sunny-outline',            costFraction: 0.09, valueBoost: 0.10, rentBoost: 0.12 },
  { id: 'ev',       label: 'EV Charger',    icon: 'flash-outline',            costFraction: 0.05, valueBoost: 0.05, rentBoost: 0.06 },
  { id: 'smart',    label: 'Smart Home',    icon: 'wifi-outline',             costFraction: 0.11, valueBoost: 0.13, rentBoost: 0.15 },
  { id: 'pool',     label: 'Pool',          icon: 'water-outline',            costFraction: 0.17, valueBoost: 0.20, rentBoost: 0.16 },
  { id: 'security', label: 'Security Sys.', icon: 'shield-checkmark-outline', costFraction: 0.03, valueBoost: 0.04, rentBoost: 0.07 },
];

export const PROPERTIES: PropertyTemplate[] = [
  // Studios — unlock: $0
  {
    id: 'studio_bronx',
    type: 'studio', name: 'Bronx Studio Loft', city: 'New York', country: 'USA',
    price: 12_000, rentPerHour: 68, unlockNetworth: 0, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80&fit=crop',
    sqft: 380,
  },
  {
    id: 'studio_detroit',
    type: 'studio', name: 'Detroit City Loft', city: 'Detroit', country: 'USA',
    price: 18_500, rentPerHour: 102, unlockNetworth: 0, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80&fit=crop',
    sqft: 420,
  },

  // Houses — unlock: $15k
  {
    id: 'house_cleveland',
    type: 'house', name: 'Cleveland Craftsman', city: 'Cleveland', country: 'USA',
    price: 32_000, rentPerHour: 165, unlockNetworth: 15_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop',
    bedrooms: 3, bathrooms: 1, sqft: 1_200,
  },
  {
    id: 'house_mexico',
    type: 'house', name: 'Mexico City Casita', city: 'Mexico City', country: 'Mexico',
    price: 42_500, rentPerHour: 218, unlockNetworth: 15_000, salesTaxRate: 0.12,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&fit=crop',
    bedrooms: 4, bathrooms: 2, sqft: 1_600,
  },
  {
    id: 'house_miami',
    type: 'house', name: 'Miami Beach Cottage', city: 'Miami', country: 'USA',
    price: 65_000, rentPerHour: 340, unlockNetworth: 15_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80&fit=crop',
    bedrooms: 3, bathrooms: 2, sqft: 1_450,
  },

  // Apartments — unlock: $80k
  {
    id: 'apt_dallas',
    type: 'apartment', name: 'Dallas Downtown Apt', city: 'Dallas', country: 'USA',
    price: 95_000, rentPerHour: 520, unlockNetworth: 80_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80&fit=crop',
    bedrooms: 2, bathrooms: 1, sqft: 900,
  },
  {
    id: 'apt_london',
    type: 'apartment', name: 'London City Flat', city: 'London', country: 'UK',
    price: 255_000, rentPerHour: 1_380, unlockNetworth: 80_000, salesTaxRate: 0.12,
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80&fit=crop',
    bedrooms: 2, bathrooms: 1, sqft: 820,
  },

  // Farmhouses — unlock: $250k
  {
    id: 'farm_kentucky',
    type: 'farmhouse', name: 'Kentucky Bluegrass Ranch', city: 'Lexington', country: 'USA',
    price: 380_000, rentPerHour: 2_100, unlockNetworth: 250_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80&fit=crop',
    bedrooms: 5, bathrooms: 3, sqft: 3_800,
  },
  {
    id: 'farm_tuscany',
    type: 'farmhouse', name: 'Tuscany Countryside Estate', city: 'Florence', country: 'Italy',
    price: 620_000, rentPerHour: 3_500, unlockNetworth: 250_000, salesTaxRate: 0.14,
    imageUrl: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600&q=80&fit=crop',
    bedrooms: 6, bathrooms: 4, sqft: 4_200,
  },

  // Villas — unlock: $600k
  {
    id: 'villa_naples',
    type: 'villa', name: 'Naples Seafront Villa', city: 'Naples', country: 'Italy',
    price: 950_000, rentPerHour: 5_800, unlockNetworth: 600_000, salesTaxRate: 0.14,
    imageUrl: 'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?w=600&q=80&fit=crop',
    bedrooms: 5, bathrooms: 4, sqft: 4_500,
  },
  {
    id: 'villa_miami',
    type: 'villa', name: 'Miami Bayfront Villa', city: 'Miami', country: 'USA',
    price: 1_250_000, rentPerHour: 7_400, unlockNetworth: 600_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80&fit=crop',
    bedrooms: 6, bathrooms: 5, sqft: 5_200,
  },

  // Condos / Penthouses — unlock: $1.2M
  {
    id: 'condo_queens',
    type: 'condo', name: 'Queens Luxury Condo', city: 'New York', country: 'USA',
    price: 990_000, rentPerHour: 5_800, unlockNetworth: 1_200_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80&fit=crop',
    bedrooms: 3, bathrooms: 2, sqft: 2_100,
  },
  {
    id: 'pent_dubai',
    type: 'penthouse', name: 'Dubai Sky Penthouse', city: 'Dubai', country: 'UAE',
    price: 3_500_000, rentPerHour: 22_000, unlockNetworth: 1_200_000, salesTaxRate: 0.05,
    imageUrl: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&q=80&fit=crop',
    bedrooms: 4, bathrooms: 4, sqft: 3_800,
  },

  // Commercial buildings — unlock: $5M
  {
    id: 'building_chicago',
    type: 'building', name: 'Chicago Office Tower', city: 'Chicago', country: 'USA',
    price: 8_200_000, rentPerHour: 56_000, unlockNetworth: 5_000_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80&fit=crop',
    sqft: 25_000,
  },

  // Mansions — unlock: $12M
  {
    id: 'mansion_la',
    type: 'mansion', name: 'Beverly Hills Mansion', city: 'Los Angeles', country: 'USA',
    price: 18_000_000, rentPerHour: 122_000, unlockNetworth: 12_000_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80&fit=crop',
    bedrooms: 9, bathrooms: 8, sqft: 11_000,
  },
  {
    id: 'mansion_malibu',
    type: 'mansion', name: 'Malibu Cliffside Estate', city: 'Malibu', country: 'USA',
    price: 26_000_000, rentPerHour: 178_000, unlockNetworth: 12_000_000, salesTaxRate: 0.10,
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80&fit=crop',
    bedrooms: 7, bathrooms: 7, sqft: 9_500,
  },

  // Island estate — unlock: $50M
  {
    id: 'island_maldives',
    type: 'island', name: 'Maldives Private Island', city: 'Malé Atoll', country: 'Maldives',
    price: 88_000_000, rentPerHour: 620_000, unlockNetworth: 50_000_000, salesTaxRate: 0.05,
    imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=80&fit=crop',
    sqft: 50_000,
  },
];

export function propertyMarketValue(template: PropertyTemplate, upgrades: string[]): number {
  let multiplier = 1;
  for (const uid of upgrades) {
    const u = PROPERTY_UPGRADES.find((u) => u.id === uid);
    if (u) multiplier += u.valueBoost;
  }
  return Math.round(template.price * multiplier);
}

export function propertyRentPerHour(template: PropertyTemplate, upgrades: string[]): number {
  let multiplier = 1;
  for (const uid of upgrades) {
    const u = PROPERTY_UPGRADES.find((u) => u.id === uid);
    if (u) multiplier += u.rentBoost;
  }
  return template.rentPerHour * multiplier;
}
