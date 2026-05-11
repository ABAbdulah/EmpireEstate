export interface StockTemplate {
  ticker: string;
  name: string;
  sector: 'tech' | 'finance' | 'energy' | 'consumer' | 'health';
  basePrice: number;
  volatility: number;
  drift: number;
  dividendYield: number;
}

export const STOCKS: StockTemplate[] = [
  { ticker: 'AD&D', name: 'Adams & Diaz',        sector: 'finance',  basePrice: 142.5,  volatility: 0.08, drift:  0.0006, dividendYield: 0.0532 },
  { ticker: 'NVRA', name: 'Novara Systems',      sector: 'tech',     basePrice: 285.0,  volatility: 0.18, drift:  0.0014, dividendYield: 0.0008 },
  { ticker: 'PYRX', name: 'Pyrex Energy',        sector: 'energy',   basePrice:  68.2,  volatility: 0.14, drift:  0.0001, dividendYield: 0.0410 },
  { ticker: 'BLLT', name: 'Bullet Logistics',    sector: 'consumer', basePrice:  34.7,  volatility: 0.10, drift:  0.0004, dividendYield: 0.0220 },
  { ticker: 'MEDX', name: 'MedExa Health',       sector: 'health',   basePrice: 198.0,  volatility: 0.09, drift:  0.0005, dividendYield: 0.0185 },
  { ticker: 'SOLR', name: 'SolarRay Inc',        sector: 'energy',   basePrice:  52.0,  volatility: 0.22, drift:  0.0020, dividendYield: 0.0050 },
  { ticker: 'QNTM', name: 'Quantum Labs',        sector: 'tech',     basePrice: 420.0,  volatility: 0.28, drift:  0.0025, dividendYield: 0.0000 },
  { ticker: 'GRFN', name: 'Griffin Bancorp',     sector: 'finance',  basePrice:  88.0,  volatility: 0.07, drift:  0.0003, dividendYield: 0.0480 },
  { ticker: 'OMNI', name: 'Omni Retail',         sector: 'consumer', basePrice:  72.3,  volatility: 0.11, drift:  0.0004, dividendYield: 0.0310 },
  { ticker: 'CRSP', name: 'CrispCore Bio',       sector: 'health',   basePrice: 165.5,  volatility: 0.20, drift:  0.0018, dividendYield: 0.0000 },
];

export interface CryptoTemplate {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
  drift: number;
}

export const CRYPTOS: CryptoTemplate[] = [
  { symbol: 'BTCN', name: 'BitCorn',     basePrice: 64200, volatility: 0.35, drift: 0.0012 },
  { symbol: 'ETRM', name: 'EtherEum',    basePrice:  3400, volatility: 0.42, drift: 0.0018 },
  { symbol: 'DGMN', name: 'DogeMoon',    basePrice:     0.085, volatility: 0.65, drift: 0.0005 },
  { symbol: 'SLNA', name: 'Solanara',    basePrice:   148, volatility: 0.48, drift: 0.0014 },
  { symbol: 'AVLN', name: 'Avalon',      basePrice:    32, volatility: 0.55, drift: 0.0010 },
];
