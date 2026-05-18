export interface StockTemplate {
  ticker: string;
  name: string;
  sector: 'tech' | 'finance' | 'energy' | 'consumer' | 'health' | 'space' | 'defense' | 'auto';
  basePrice: number;
  volatility: number;
  drift: number;
  dividendYield: number;
  unlockNetworth: number; // net worth required to see and trade
  color: string;         // brand color for icon circle
}

export const STOCKS: StockTemplate[] = [
  // Tier 1 — unlock: $0
  { ticker: 'AD&D',  name: 'Adams & Diaz',     sector: 'finance',  basePrice: 142.5,  volatility: 0.08, drift:  0.0006, dividendYield: 0.053, unlockNetworth: 0,          color: '#2563EB' },
  { ticker: 'BLLT',  name: 'Bullet Logistics', sector: 'consumer', basePrice:  34.7,  volatility: 0.10, drift:  0.0004, dividendYield: 0.022, unlockNetworth: 0,          color: '#D97706' },
  { ticker: 'GRFN',  name: 'Griffin Bancorp',  sector: 'finance',  basePrice:  88.0,  volatility: 0.07, drift:  0.0003, dividendYield: 0.048, unlockNetworth: 0,          color: '#059669' },
  { ticker: 'OMNI',  name: 'Omni Retail',      sector: 'consumer', basePrice:  72.3,  volatility: 0.11, drift:  0.0004, dividendYield: 0.031, unlockNetworth: 0,          color: '#7C3AED' },
  { ticker: 'TOYDA', name: 'Toyoda Motors',    sector: 'auto',     basePrice:  18.5,  volatility: 0.09, drift:  0.0003, dividendYield: 0.025, unlockNetworth: 0,          color: '#DC2626' },

  // Tier 2 — unlock: $10k
  { ticker: 'PYRX',  name: 'Pyrex Energy',     sector: 'energy',   basePrice:  68.2,  volatility: 0.14, drift:  0.0001, dividendYield: 0.041, unlockNetworth: 10_000,     color: '#EA580C' },
  { ticker: 'MEDX',  name: 'MedExa Health',    sector: 'health',   basePrice: 198.0,  volatility: 0.09, drift:  0.0005, dividendYield: 0.019, unlockNetworth: 10_000,     color: '#0891B2' },
  { ticker: 'BLST',  name: 'BlueStone Bank',   sector: 'finance',  basePrice: 215.0,  volatility: 0.08, drift:  0.0005, dividendYield: 0.039, unlockNetworth: 10_000,     color: '#1D4ED8' },

  // Tier 3 — unlock: $75k
  { ticker: 'NVRA',  name: 'Novara Systems',   sector: 'tech',     basePrice: 285.0,  volatility: 0.18, drift:  0.0014, dividendYield: 0.001, unlockNetworth: 75_000,     color: '#6D28D9' },
  { ticker: 'SOLR',  name: 'SolarRay Inc',     sector: 'energy',   basePrice:  52.0,  volatility: 0.22, drift:  0.0020, dividendYield: 0.005, unlockNetworth: 75_000,     color: '#F59E0B' },
  { ticker: 'CRSP',  name: 'CrispCore Bio',    sector: 'health',   basePrice: 165.5,  volatility: 0.20, drift:  0.0018, dividendYield: 0.000, unlockNetworth: 75_000,     color: '#10B981' },
  { ticker: 'AXON',  name: 'Axon Defense',     sector: 'defense',  basePrice: 322.0,  volatility: 0.13, drift:  0.0009, dividendYield: 0.015, unlockNetworth: 75_000,     color: '#374151' },

  // Tier 4 — unlock: $500k
  { ticker: 'QNTM',  name: 'Quantum Labs',     sector: 'tech',     basePrice: 420.0,  volatility: 0.28, drift:  0.0025, dividendYield: 0.000, unlockNetworth: 500_000,    color: '#8B5CF6' },
  { ticker: 'MEGA',  name: 'MegaCorp Global',  sector: 'consumer', basePrice: 1_240,  volatility: 0.12, drift:  0.0011, dividendYield: 0.028, unlockNetworth: 500_000,    color: '#0F172A' },
  { ticker: 'BRNK',  name: 'Brennan Capital',  sector: 'finance',  basePrice: 980.0,  volatility: 0.09, drift:  0.0008, dividendYield: 0.035, unlockNetworth: 500_000,    color: '#1E3A8A' },

  // Tier 5 — unlock: $5M
  { ticker: 'NACA',  name: 'Naca Aerospace',   sector: 'space',    basePrice: 8_500,  volatility: 0.35, drift:  0.0030, dividendYield: 0.000, unlockNetworth: 5_000_000,  color: '#1E40AF' },
  { ticker: 'HLVT',  name: 'HelioVolt Power',  sector: 'energy',   basePrice: 3_200,  volatility: 0.20, drift:  0.0022, dividendYield: 0.012, unlockNetworth: 5_000_000,  color: '#B45309' },
];

export interface CryptoTemplate {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
  drift: number;
  unlockNetworth: number;
  color: string;
}

export const CRYPTOS: CryptoTemplate[] = [
  // Tier 1 — unlock: $0
  { symbol: 'DGMN',  name: 'DogeMoon',    basePrice:    0.085, volatility: 0.65, drift: 0.0005, unlockNetworth: 0,       color: '#B45309' },
  { symbol: 'AVLN',  name: 'Avalon',      basePrice:   32.0,   volatility: 0.55, drift: 0.0010, unlockNetworth: 0,       color: '#DC2626' },
  { symbol: 'PLTX',  name: 'PolyTex',     basePrice:    0.50,  volatility: 0.60, drift: 0.0006, unlockNetworth: 0,       color: '#7C3AED' },

  // Tier 2 — unlock: $10k
  { symbol: 'SLNA',  name: 'Solanara',    basePrice:  148.0,   volatility: 0.48, drift: 0.0014, unlockNetworth: 10_000,  color: '#9333EA' },
  { symbol: 'CRDN',  name: 'Cardanox',    basePrice:    0.50,  volatility: 0.40, drift: 0.0008, unlockNetworth: 10_000,  color: '#2563EB' },
  { symbol: 'LCHT',  name: 'LightCoin',   basePrice:   72.0,   volatility: 0.38, drift: 0.0007, unlockNetworth: 10_000,  color: '#475569' },

  // Tier 3 — unlock: $75k
  { symbol: 'ETRM',  name: 'EtherEum',    basePrice: 3_400,    volatility: 0.42, drift: 0.0018, unlockNetworth: 75_000,  color: '#6366F1' },
  { symbol: 'XVRS',  name: 'XVerseToken', basePrice:    0.36,  volatility: 0.70, drift: 0.0003, unlockNetworth: 75_000,  color: '#0F172A' },

  // Tier 4 — unlock: $500k
  { symbol: 'BTCN',  name: 'BitCorn',     basePrice: 64_200,   volatility: 0.35, drift: 0.0012, unlockNetworth: 500_000, color: '#F59E0B' },
  { symbol: 'EXXS',  name: 'Exxes',       basePrice: 405_230,  volatility: 0.25, drift: 0.0020, unlockNetworth: 500_000, color: '#059669' },
];
