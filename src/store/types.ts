export interface OwnedBusiness {
  templateId: string;
  level: number;
  hasManager: boolean;
  lastCollectedAt: number;
  totalEarned: string;
}

export interface OwnedStock {
  ticker: string;
  quantity: number;
  avgCost: string;
}

export interface OwnedCrypto {
  symbol: string;
  quantity: number;
  avgCost: string;
}

export interface OwnedItem {
  uid: string;
  templateId: string;
  purchasePrice: string;
  purchaseDate: number;
  currentValueMultiplier: number;
}

export interface ActiveBoost {
  id: 'tap_2x' | 'business_30' | 'business_100';
  multiplier: number;
  endsAt: number;
}

export interface GameState {
  balance: string;
  lastTickAt: number;
  totalEarned: string;
  totalSpent: string;
  daysPlayed: number;
  installedAt: number;

  tapLevel: number;
  tapXp: number;
  totalTaps: number;

  prestigeStars: number;
  prestigeCount: number;

  businesses: Record<string, OwnedBusiness>;
  stocks: Record<string, OwnedStock>;
  cryptos: Record<string, OwnedCrypto>;
  items: OwnedItem[];
  collections: Record<string, string[]>;

  taxDueAt: number;
  taxAccrued: string;

  boosts: ActiveBoost[];

  settings: {
    sound: boolean;
    haptics: boolean;
    notifications: boolean;
  };

  vip: boolean;
  noAds: boolean;
}

export const INITIAL_STATE: GameState = {
  balance: '50',
  lastTickAt: 0,
  totalEarned: '0',
  totalSpent: '0',
  daysPlayed: 0,
  installedAt: 0,

  tapLevel: 1,
  tapXp: 0,
  totalTaps: 0,

  prestigeStars: 0,
  prestigeCount: 0,

  businesses: {},
  stocks: {},
  cryptos: {},
  items: [],
  collections: {},

  taxDueAt: 0,
  taxAccrued: '0',

  boosts: [],

  settings: {
    sound: false,
    haptics: true,
    notifications: true,
  },

  vip: false,
  noAds: false,
};
