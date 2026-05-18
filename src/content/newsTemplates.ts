// Deterministic daily news that links to market price movements.
// Same day seed selects articles for both the News tab and the market drift calculation.

export type NewsSector = 'tech' | 'finance' | 'energy' | 'consumer' | 'health' | 'space' | 'defense' | 'auto' | 'crypto' | 'real-estate' | 'all';

export type NewsCategory = 'Stocks' | 'Crypto' | 'Real Estate' | 'Business' | 'Economy';

export interface NewsTemplate {
  id: string;
  category: NewsCategory;
  source: string;
  headline: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  affectedSectors: NewsSector[];
  impactBias: number;        // added to daily drift for affected sectors
  forecastDirection: 'up' | 'down' | 'neutral';
  forecastDays: number;      // days ahead for the forecast date shown in UI
}

export const NEWS_TEMPLATES: NewsTemplate[] = [
  // ── TECH ──────────────────────────────────────────────────────────────────
  {
    id: 'tech-01', category: 'Stocks', source: 'CNBiz', headline: 'AI chip demand surges as major tech firm announces record data-center rollout',
    summary: 'A leading semiconductor maker reported order backlog at an all-time high, with enterprise customers accelerating purchases ahead of next-generation model releases. Analyst upgrades followed immediately.',
    sentiment: 'positive', affectedSectors: ['tech'], impactBias: 0.018, forecastDirection: 'up', forecastDays: 3,
  },
  {
    id: 'tech-02', category: 'Stocks', source: 'TechFinance', headline: 'Cybersecurity breach at cloud giant sparks sector-wide investigation',
    summary: 'A widely-used enterprise cloud platform disclosed unauthorized access affecting millions of accounts. Regulators have opened inquiries and customer churn fears are dragging the entire tech sector lower.',
    sentiment: 'negative', affectedSectors: ['tech'], impactBias: -0.015, forecastDirection: 'down', forecastDays: 2,
  },
  {
    id: 'tech-03', category: 'Stocks', source: 'MarketScope', headline: 'Quantum computing milestone achieved — practical applications now in sight',
    summary: 'A research consortium demonstrated 1,000-qubit error correction, cutting simulated drug discovery timelines by 80%. Markets reacted positively to the breakthrough\'s commercial implications for tech and health.',
    sentiment: 'positive', affectedSectors: ['tech', 'health'], impactBias: 0.012, forecastDirection: 'up', forecastDays: 5,
  },
  {
    id: 'tech-04', category: 'Business', source: 'FinTrade', headline: 'Tech sector faces sweeping antitrust review in three major markets',
    summary: 'Regulators across the EU, UK and one major Asian economy announced coordinated probes into platform monopoly practices. Legal costs and forced divestitures could weigh on multiples for several years.',
    sentiment: 'negative', affectedSectors: ['tech', 'consumer'], impactBias: -0.010, forecastDirection: 'down', forecastDays: 7,
  },

  // ── FINANCE ───────────────────────────────────────────────────────────────
  {
    id: 'fin-01', category: 'Stocks', source: 'DailyMarket', headline: 'Central bank signals pause on rate hikes — markets cheer the pivot',
    summary: 'Minutes from the latest policy meeting revealed board members leaning toward holding rates steady through the next two quarters, reducing borrowing costs for banks and lifting bond prices across the board.',
    sentiment: 'positive', affectedSectors: ['finance', 'real-estate'], impactBias: 0.009, forecastDirection: 'up', forecastDays: 4,
  },
  {
    id: 'fin-02', category: 'Stocks', source: 'MarketBeacon', headline: 'Annual bank stress tests show resilience; dividend hikes expected',
    summary: 'Regulators confirmed all major institutions passed this year\'s stress scenario, clearing the way for capital returns. Several banks immediately announced larger buyback programs and increased quarterly dividends.',
    sentiment: 'positive', affectedSectors: ['finance'], impactBias: 0.007, forecastDirection: 'up', forecastDays: 3,
  },
  {
    id: 'fin-03', category: 'Economy', source: 'CapitalView', headline: 'Credit-card delinquencies rise to four-year high amid household debt pressure',
    summary: 'Industry data showed 30-day delinquency rates climbing for the third consecutive quarter, raising concern about consumer balance sheet health and potentially increasing loan-loss provisions at lenders.',
    sentiment: 'negative', affectedSectors: ['finance', 'consumer'], impactBias: -0.009, forecastDirection: 'down', forecastDays: 4,
  },

  // ── ENERGY ────────────────────────────────────────────────────────────────
  {
    id: 'ene-01', category: 'Stocks', source: 'EnergyWatch', headline: 'OREC+ alliance agrees to extend production cuts through the end of the year',
    summary: 'The oil-producing coalition voted unanimously to roll over existing cuts, citing demand uncertainty. Crude futures rose 3.8% on the news, lifting upstream exploration and integrated oil companies.',
    sentiment: 'positive', affectedSectors: ['energy'], impactBias: 0.015, forecastDirection: 'up', forecastDays: 3,
  },
  {
    id: 'ene-02', category: 'Stocks', source: 'MarketScope', headline: 'Record solar installations drive renewables index to annual high',
    summary: 'New data confirmed that utility-scale solar capacity added this year exceeded the previous record by 34%. Grid parity projections now favor solar in 88% of global markets, accelerating capital flows into the sector.',
    sentiment: 'positive', affectedSectors: ['energy'], impactBias: 0.012, forecastDirection: 'up', forecastDays: 5,
  },
  {
    id: 'ene-03', category: 'Stocks', source: 'EnergyWatch', headline: 'Natural gas futures drop as mild weather dampens heating demand',
    summary: 'Warmer-than-seasonal forecasts for the next six weeks sent natural gas prices tumbling 8%, dragging midstream and LNG shipping names lower. Utility stocks showed relative resilience on the move.',
    sentiment: 'negative', affectedSectors: ['energy'], impactBias: -0.011, forecastDirection: 'down', forecastDays: 3,
  },

  // ── CONSUMER ──────────────────────────────────────────────────────────────
  {
    id: 'con-01', category: 'Business', source: 'Entrepify', headline: 'Retail sales jump 1.4% in latest monthly read, beating all forecasts',
    summary: 'Strong discretionary spending — especially on electronics and home goods — surprised economists to the upside, easing recession fears and lifting consumer-facing stocks broadly on the open.',
    sentiment: 'positive', affectedSectors: ['consumer'], impactBias: 0.010, forecastDirection: 'up', forecastDays: 2,
  },
  {
    id: 'con-02', category: 'Business', source: 'ReutorNews', headline: 'Major port congestion re-emerges, raising supply-chain cost alarms',
    summary: 'A labor dispute at two of the world\'s largest cargo hubs has caused vessel queues to spike. Importers now face multi-week delays that analysts warn will push consumer prices higher over the coming months.',
    sentiment: 'negative', affectedSectors: ['consumer', 'auto'], impactBias: -0.009, forecastDirection: 'down', forecastDays: 5,
  },
  {
    id: 'con-03', category: 'Business', source: 'DailyMarket', headline: 'E-commerce penetration hits new record, traditional retail under pressure',
    summary: 'Online sales captured 24% of all retail spending for the first time, according to a new industry report. Logistics and fulfillment companies surged while brick-and-mortar names retreated.',
    sentiment: 'positive', affectedSectors: ['consumer'], impactBias: 0.008, forecastDirection: 'up', forecastDays: 4,
  },

  // ── HEALTH ────────────────────────────────────────────────────────────────
  {
    id: 'hlt-01', category: 'Stocks', source: 'HealthMarkets', headline: 'Regulators approve breakthrough oncology treatment in accelerated review',
    summary: 'A novel targeted therapy demonstrated 72% remission rates in late-stage trials, far exceeding the control arm. Analysts project peak annual sales exceeding $9B, triggering sector-wide re-rating.',
    sentiment: 'positive', affectedSectors: ['health'], impactBias: 0.020, forecastDirection: 'up', forecastDays: 4,
  },
  {
    id: 'hlt-02', category: 'Stocks', source: 'HealthMarkets', headline: 'High-profile biotech trial fails Phase III — sector pulls back sharply',
    summary: 'A long-awaited gene therapy missed its primary endpoint by a wide margin, sending the developer down 38% and casting doubt on competing programs using similar delivery mechanisms. Spillover hit the broader sector.',
    sentiment: 'negative', affectedSectors: ['health'], impactBias: -0.015, forecastDirection: 'down', forecastDays: 3,
  },
  {
    id: 'hlt-03', category: 'Economy', source: 'CapitalView', headline: 'Global health agency upgrades pharma sector growth forecast to 8%',
    summary: 'Revised demographic modeling shows aging populations in developed economies will sustain prescription volume growth well into the next decade, underpinning a bullish long-term view on the sector.',
    sentiment: 'positive', affectedSectors: ['health'], impactBias: 0.010, forecastDirection: 'up', forecastDays: 6,
  },

  // ── DEFENSE ───────────────────────────────────────────────────────────────
  {
    id: 'def-01', category: 'Stocks', source: 'DefenseDaily', headline: 'Government awards $42B multi-year defense procurement package to domestic firms',
    summary: 'A sweeping modernization program covers advanced radar systems, autonomous vehicles, and next-generation aircraft. Revenue visibility for prime contractors is now secured through the end of the decade.',
    sentiment: 'positive', affectedSectors: ['defense'], impactBias: 0.018, forecastDirection: 'up', forecastDays: 5,
  },
  {
    id: 'def-02', category: 'Stocks', source: 'DefenseDaily', headline: 'Defense stocks retreat as major ceasefire deal reduces near-term demand signals',
    summary: 'A surprise diplomatic agreement between two long-standing conflict parties reduced urgency around emergency procurement. Several defense majors issued cautious near-term revenue guidance in response.',
    sentiment: 'negative', affectedSectors: ['defense'], impactBias: -0.012, forecastDirection: 'down', forecastDays: 4,
  },
  {
    id: 'def-03', category: 'Stocks', source: 'ReutorNews', headline: 'New electronic warfare contract boosts domestic defense manufacturer',
    summary: 'A classified next-generation jamming system contract worth an estimated $7B was awarded to a mid-tier specialist, pushing the stock up 12% and drawing attention to similar under-covered defense names.',
    sentiment: 'positive', affectedSectors: ['defense'], impactBias: 0.014, forecastDirection: 'up', forecastDays: 3,
  },

  // ── SPACE ─────────────────────────────────────────────────────────────────
  {
    id: 'spc-01', category: 'Stocks', source: 'SpaceTrade', headline: 'Private launch company completes record orbital satellite deployment',
    summary: 'A single mission delivered 94 commercial satellites — the highest payload count ever — at a cost-per-kg that undercuts existing competitors by 40%. Booking backlogs reportedly extend to three years.',
    sentiment: 'positive', affectedSectors: ['space', 'tech'], impactBias: 0.022, forecastDirection: 'up', forecastDays: 4,
  },
  {
    id: 'spc-02', category: 'Stocks', source: 'SpaceTrade', headline: 'Space mission delayed after technical review flags propulsion concern',
    summary: 'An independent safety board issued a hold on a high-profile crewed mission, citing unresolved questions about thruster redundancy. The delay adds cost uncertainty and shifts revenue recognition timelines.',
    sentiment: 'negative', affectedSectors: ['space'], impactBias: -0.018, forecastDirection: 'down', forecastDays: 3,
  },
  {
    id: 'spc-03', category: 'Stocks', source: 'CNBiz', headline: 'Satellite broadband constellation expansion fuels long-term sector optimism',
    summary: 'A major low-earth orbit network announced expansion to 8,000 additional satellites over five years, projecting global coverage in 98% of populated areas. Institutional investors increased position sizes materially.',
    sentiment: 'positive', affectedSectors: ['space', 'tech'], impactBias: 0.015, forecastDirection: 'up', forecastDays: 6,
  },

  // ── AUTO ──────────────────────────────────────────────────────────────────
  {
    id: 'aut-01', category: 'Business', source: 'AutoScope', headline: 'EV adoption accelerates as charging network doubles year-over-year',
    summary: 'Charging infrastructure additions outpaced sales growth for the first time, resolving the "range anxiety" barrier that had slowed mass-market electric adoption. Auto makers with strong EV lineups saw upgrades.',
    sentiment: 'positive', affectedSectors: ['auto', 'energy'], impactBias: 0.012, forecastDirection: 'up', forecastDays: 4,
  },
  {
    id: 'aut-02', category: 'Business', source: 'AutoScope', headline: 'Rising lithium and cobalt costs squeeze auto-sector margins',
    summary: 'Battery input prices have climbed 22% in six months, preventing automakers from passing full EV savings to consumers. Margin guidance was revised lower across three major manufacturers.',
    sentiment: 'negative', affectedSectors: ['auto'], impactBias: -0.011, forecastDirection: 'down', forecastDays: 3,
  },
  {
    id: 'aut-03', category: 'Business', source: 'ReutorNews', headline: 'Major carmaker reports record quarterly deliveries, raises full-year outlook',
    summary: 'Strong demand across Europe and Southeast Asia drove unit sales to an all-time quarterly high. The manufacturer raised its annual guidance by 8% and announced two new assembly plant investments.',
    sentiment: 'positive', affectedSectors: ['auto'], impactBias: 0.015, forecastDirection: 'up', forecastDays: 2,
  },

  // ── CRYPTO ────────────────────────────────────────────────────────────────
  {
    id: 'cry-01', category: 'Crypto', source: 'CoinBeat', headline: 'Institutional digital-asset adoption reaches record high as pension funds enter',
    summary: 'Multiple major pension funds disclosed initial allocations to digital assets, citing portfolio diversification and inflation hedging. On-chain accumulation metrics confirm sustained buying at current levels.',
    sentiment: 'positive', affectedSectors: ['crypto'], impactBias: 0.030, forecastDirection: 'up', forecastDays: 5,
  },
  {
    id: 'cry-02', category: 'Crypto', source: 'BlockWire', headline: 'Regulators propose strict stablecoin reserve rules — markets on edge',
    summary: 'Draft legislation would require stablecoin issuers to hold 110% liquid reserves audited monthly. While welcomed by institutions, the rules would force restructuring at several major issuers, unsettling the sector.',
    sentiment: 'negative', affectedSectors: ['crypto'], impactBias: -0.025, forecastDirection: 'down', forecastDays: 4,
  },
  {
    id: 'cry-03', category: 'Crypto', source: 'TheChain', headline: 'DeFi protocol surpasses $50B in total value locked — a new all-time high',
    summary: 'Yield-bearing strategies in decentralized finance attracted a fresh wave of capital after annualized returns rose above 12% on major pools, drawing in retail and semi-institutional participants alike.',
    sentiment: 'positive', affectedSectors: ['crypto'], impactBias: 0.020, forecastDirection: 'up', forecastDays: 3,
  },
  {
    id: 'cry-04', category: 'Crypto', source: 'DeCrypt', headline: 'Major crypto exchange reports security breach — withdrawals suspended',
    summary: 'Hackers exploited a smart-contract vulnerability to extract an estimated $340M in assets. The exchange halted withdrawals for all users while an investigation proceeds, triggering broad market panic selling.',
    sentiment: 'negative', affectedSectors: ['crypto'], impactBias: -0.035, forecastDirection: 'down', forecastDays: 2,
  },
  {
    id: 'cry-05', category: 'Crypto', source: 'CoinBeat', headline: 'Spot ETF approval rumours send leading digital asset past key resistance',
    summary: 'Anonymous regulatory sources suggest a decision on a major spot ETF product is weeks away. Options markets show significant positioning for upside, with open interest in calls surging to multi-month highs.',
    sentiment: 'positive', affectedSectors: ['crypto'], impactBias: 0.028, forecastDirection: 'up', forecastDays: 4,
  },

  // ── REAL ESTATE ───────────────────────────────────────────────────────────
  {
    id: 're-01', category: 'Real Estate', source: 'PropScope', headline: 'Mortgage rates fall to six-month low, igniting buyer demand in key markets',
    summary: 'A 40-basis-point decline in the benchmark mortgage rate over three weeks has revived housing demand in previously cooling markets. Applications surged 18% week-over-week across major metro areas.',
    sentiment: 'positive', affectedSectors: ['real-estate', 'finance'], impactBias: 0.012, forecastDirection: 'up', forecastDays: 4,
  },
  {
    id: 're-02', category: 'Real Estate', source: 'PropScope', headline: 'Commercial real estate vacancies reach decade high amid remote-work shift',
    summary: 'Grade-A office vacancies in top-tier business districts climbed to 19.4%, the highest in ten years. Analysts warn of forced disposals from overleveraged landlords, which could further depress valuations.',
    sentiment: 'negative', affectedSectors: ['real-estate'], impactBias: -0.010, forecastDirection: 'down', forecastDays: 5,
  },
  {
    id: 're-03', category: 'Real Estate', source: 'LuxPropGlobal', headline: 'Luxury coastal property sales boom driven by international buyer surge',
    summary: 'Ultra-high-net-worth demand from European and Asian buyers has pushed premium coastal properties to new price records. Inventory in the luxury segment is at its lowest in seven years, supporting further appreciation.',
    sentiment: 'positive', affectedSectors: ['real-estate'], impactBias: 0.015, forecastDirection: 'up', forecastDays: 6,
  },
  {
    id: 're-04', category: 'Real Estate', source: 'PropCurve', headline: 'US farmland values set new records across heartland states',
    summary: 'Food security concerns, institutional demand and tight supply have pushed agricultural land prices up 14% year-on-year in several Midwest states. Farmland REITs have been the top-performing real estate sub-sector.',
    sentiment: 'positive', affectedSectors: ['real-estate'], impactBias: 0.013, forecastDirection: 'up', forecastDays: 5,
  },

  // ── MACRO / ALL ───────────────────────────────────────────────────────────
  {
    id: 'mac-01', category: 'Economy', source: 'CapitalView', headline: 'Inflation cools to two-year low — rate cut bets rise sharply',
    summary: 'The latest CPI print came in well below consensus, with core services inflation finally showing signs of normalization. Futures markets now price in two rate cuts within the next six months, boosting equities broadly.',
    sentiment: 'positive', affectedSectors: ['all'], impactBias: 0.012, forecastDirection: 'up', forecastDays: 4,
  },
  {
    id: 'mac-02', category: 'Economy', source: 'DailyMarket', headline: 'Geopolitical conflict escalates — global markets retreat to safety assets',
    summary: 'Renewed military action between two resource-rich nations sparked a flight to gold and government bonds. Equities, crypto and industrial commodities all sold off simultaneously in one of the year\'s sharpest risk-off sessions.',
    sentiment: 'negative', affectedSectors: ['all'], impactBias: -0.015, forecastDirection: 'down', forecastDays: 3,
  },
  {
    id: 'mac-03', category: 'Economy', source: 'ReutorNews', headline: 'GDP growth beats forecasts — economy expands at fastest pace in six quarters',
    summary: 'Robust business investment and resilient consumer spending pushed annualized growth to 3.1%, well ahead of the 2.2% consensus estimate. Risk appetite improved across asset classes on the stronger-than-expected print.',
    sentiment: 'positive', affectedSectors: ['all'], impactBias: 0.010, forecastDirection: 'up', forecastDays: 5,
  },
  {
    id: 'mac-04', category: 'Economy', source: 'FinTrade', headline: 'Trade war escalation threatens supply chains — tariffs raised on key goods',
    summary: 'Two major economic powers announced retaliatory tariff increases covering $180B of annual trade. Manufacturers with global supply chains, auto makers and technology hardware names face the most direct exposure.',
    sentiment: 'negative', affectedSectors: ['all'], impactBias: -0.012, forecastDirection: 'down', forecastDays: 6,
  },
  {
    id: 'mac-05', category: 'Economy', source: 'MarketBeacon', headline: 'Small business sentiment hits 18-month high ahead of policy decision',
    summary: 'A quarterly survey of more than 1,200 entrepreneurs showed rising optimism around hiring plans and capital investment over the next six months, contrasting with cautious guidance from large-cap multinationals.',
    sentiment: 'positive', affectedSectors: ['consumer', 'finance'], impactBias: 0.007, forecastDirection: 'up', forecastDays: 4,
  },
];

// ── Shared hash / RNG (mirrors market.ts, kept in sync manually) ────────────
function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NEWS_PER_DAY = 8;

function pickDayIndices(day: number): number[] {
  const rnd = mulberry32(hash32(`news-${day}`));
  const picks = new Set<number>();
  while (picks.size < NEWS_PER_DAY) {
    picks.add(Math.floor(rnd() * NEWS_TEMPLATES.length));
  }
  return Array.from(picks);
}

/** Returns the articles selected for a given day (same set the market uses). */
export function getDayNews(day: number): NewsTemplate[] {
  return pickDayIndices(day).map((i) => NEWS_TEMPLATES[i]);
}

/** Returns the total drift bias for a given sector on a given day. */
export function getDayNewsImpact(sector: string, day: number): number {
  return pickDayIndices(day).reduce((sum, i) => {
    const item = NEWS_TEMPLATES[i];
    if (item.affectedSectors.includes(sector as NewsSector) || item.affectedSectors.includes('all')) {
      return sum + item.impactBias;
    }
    return sum;
  }, 0);
}
