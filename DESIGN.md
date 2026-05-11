# EmpireState — Design & Build Plan

> A mobile **financial-hub tycoon** where players grow a fortune across businesses, stocks, crypto, real estate, and luxury collectibles. Designed as a polished idle-sim with a fintech-grade UI.

- **Status:** Pre-production design
- **Stack:** React Native + Expo (iOS & Android, single codebase)
- **Backend:** Offline-first, local-only persistence
- **Monetization:** Rewarded ads + remove-ads IAP + currency packs + VIP subscription

---

## 1. Vision

Players step into the shoes of a self-made tycoon. The first 60 seconds feel like a finance app — a clean networth dashboard, color-coded asset cards, a "Fortune" headline number. The next 5 minutes reveal the game underneath: tap to earn, buy a lemonade-stand-tier business, watch idle income tick up, weather a stock dip, sell at the top, upgrade to a factory, buy a yacht.

The mood we are NOT building toward: chunky cartoon coins, neon casino vibes, slot-machine animations, screen-blocking ads. The reference look is closer to **Revolut / Robinhood / Cash App** mixed with the *progression dopamine* of **AdVenture Capitalist** and **Idle Miner Tycoon**. The market is crowded with idle tycoons that all look the same; our wedge is **production-grade UI that feels like a real money app.**

### Differentiators vs. the existing app shown in references
The reference app has the right systems but suffers from:
- Information-dense screens with no visual hierarchy (every card looks equally important)
- Ads stacked on top of game UI without separation, breaking trust
- Inconsistent iconography (mix of flat illustrations, 3D renders, line icons)
- No motion language — every screen change is a hard cut
- Numbers shown to 2 decimals everywhere, including networth ($1.1M alongside $109.54)
- Weak empty states ("0 of 20", "$0.00 Pending") that demotivate new players

We fix every one of those.

---

## 2. Reference & Competitive Analysis

| Game | What we steal | What we avoid |
|---|---|---|
| **AdVenture Capitalist** | The "buy 1 / 10 / 100" upgrade buttons, manager-automation unlock moment, prestige loop | Cartoon-only art direction; we want photoreal asset shots |
| **Idle Miner Tycoon** | Multi-business management, vertical scroll of holdings, hire-managers UX | Cluttered HUD; ad icons baked into every card |
| **Cash, Inc.** | Tap-to-earn juice, tier-up reveal animations | Aggressive interstitial cadence |
| **Bitlife** | Life-sim flavor (taxes, residences, life choices) for retention | Text-only screens; we are visual-first |
| **Egg, Inc.** | Prestige system, soft research tree, long-tail engagement | Theme |
| **Robinhood / Revolut** | Card-based dashboard, sparkline charts, ticker UI, subdued palette | Their actual UX restraint — we add game energy on top |

**Top competitors in the App Store "Simulation" category:** Idle Miner Tycoon, Bitcoin Billionaire, Tycoon Business Simulator, Cash Inc., Idle Tycoon: Wild West Clondike, Mall Tycoon.

---

## 3. Target Audience

**Primary persona — "The Commuter Capitalist"**
- 22–40, owns smartphone, plays in 3–8 minute sessions on transit / breaks
- Has used at least one finance app (Revolut, Cash App, Robinhood, Binance)
- Plays 1–2 idle games at a time, churns out of them when UI fatigue sets in
- Spends $0–$15/mo on mobile games; will pay for "remove ads" but resents pay-to-win

**Secondary persona — "The Min-Maxer"**
- 16–28, posts on r/incremental_games, reads guides
- Wants depth: prestige math, ROI calculators, optimal-buy hints
- Drives word-of-mouth; we keep them with clear numbers and exportable stats

**We are not targeting:** kids (no IAP-bait, no aggressive notifications), casino-style gamblers (no loot boxes).

---

## 4. Core Game Loop

```
                    +----------------------+
                    |  Earn (tap / idle)   |
                    +----------+-----------+
                               |
              +----------------v----------------+
              |  Allocate capital across:       |
              |  - Businesses (idle $/hr)       |
              |  - Stocks (volatile yield)      |
              |  - Crypto (high-risk yield)     |
              |  - Real estate (slow + stable)  |
              |  - Collectibles (appreciation)  |
              +----------------+----------------+
                               |
              +----------------v----------------+
              |  Networth grows -> unlock new   |
              |  tiers, businesses, assets      |
              +----------------+----------------+
                               |
              +----------------v----------------+
              |  Prestige ("New Generation"):   |
              |  reset for permanent multiplier |
              +---------------------------------+
```

**Session loop (3–8 min):**
1. Open app → see offline earnings reward modal → collect (animated count-up)
2. Glance at networth + delta since last session
3. Check stock/crypto tickers — sell any "highlighted as overvalued"
4. Buy upgrades for businesses or unlock a new one
5. (Optional) Watch rewarded ad for income boost
6. Tap-to-earn for a minute while reading next decision
7. Close app → app records timestamp for offline accrual

**Long-arc loop (days–weeks):**
1. Unlock all businesses in current generation
2. Build first stock portfolio, survive first market crash
3. Buy first luxury asset (car → yacht → jet)
4. Complete a collection (coins, paintings, retro cars)
5. Hit prestige threshold → reset for permanent multiplier
6. Re-run faster; unlock prestige-locked content

---

## 5. Information Architecture — 5 Tabs

Bottom tab bar: **Investing · Business · Earnings · Items · Profile**

> Order matters. `Earnings` is centered because it is the most-tapped screen (tap-to-earn) and the natural "home." Profile sits at the far right because it is the networth dashboard players check less often but with high emotional weight.

### 5.1 Profile Tab — the Networth Dashboard

**Purpose:** the trophy case. Where players come to see *how rich they are*.

**Top of screen:**
- Avatar + display name + "Connect" button (cloud sync teaser, post-MVP)
- **Headline number: "Fortune $1.1 M"** — large, no decimals when ≥ $1M, abbreviated past 1B (1.2B, 1.45T)
- Animated count-up on every screen entry (300ms ease-out, never longer)
- Tiny delta chip: `+$12,340 today` in green / `-$8.4k today` in red, tappable for a 7-day sparkline

**Asset breakdown — 8 cards in a 2-column grid:**

| Card | Color accent | Source of value |
|---|---|---|
| Balance | Steel blue | Liquid cash |
| Businesses | Coral | Sum of business cash-out value |
| Stocks | Amber | Mark-to-market of shares |
| Real Estate | Mauve | Properties × current valuation |
| Transport | Forest green | Car/jet/yacht resale value |
| Collections | Violet | Sum of completed-set bonuses |
| Cryptoassets | Mint | Mark-to-market of holdings |
| Residence | Deep blue | Primary home valuation |

Each card: colored left-edge bar (12% width), category name (caption), value (headline). Tap → drills into that category's detail page. **No cards say "$0.00" — empty cards show a single-line CTA like "Buy your first business →".**

**Below the grid:**
- **Taxes module:** progress bar to next tax payment due-date, "Pay all taxes" primary action. Tax = % of income earned since last payment; failing to pay applies a temporary income debuff.
- **Stats strip:** Total earned (all-time), Total spent, Days played, Prestige count
- **Settings / About / Support** entry points (small text links, not buttons)

### 5.2 Business Tab — the Idle Engine

**Purpose:** the main idle-progression surface. Where 60% of player decisions happen.

**Top header:**
- "Total income per hour" headline ($17,658.42 in reference)
- Trend chip: "▲ 12% vs last hour"
- **Two primary actions side-by-side:** `Start a business` (primary blue) and `Business mergers` (ghost)
- Slot counter ("7 of 10 slots") with one-tap "Buy a slot" overlay

**Companies list (vertical scroll):**

Each company card shows:
- Color-coded icon (industry sector)
- Name + sector label
- Level dots / production bar ("3 of 50" managers, or "5/5" capacity)
- $X.XX per hour (or "Pending — collects in 2m 14s")
- Right-chevron → detail page

**Business detail page (per company):**
- Hero illustration of the business (factory, restaurant, mine, IT company)
- **Income chart** (last 24h, Skia-rendered sparkline)
- **Upgrade row:** `Level Up ×1 / ×10 / ×100 / Max` (cost displayed, greyed if unaffordable)
- **Manager card:** "Hire manager $50k" → once hired, the business auto-collects (idle)
- **Boosts row:** Rewarded-ad "+30% income for 4h", Premium "+100% income for 24h" (IAP)
- Stats: total earned by this business, ROI %, age of business

**Start-a-business flow:**
- Modal sheet, swipeable through available industries (Food / Transport / Tech / Heavy Industry / Entertainment / Finance)
- Each industry shows: starting cost, base $/hr, upgrade cap, "unlocks at networth $X"
- "Buy" → confetti pulse → card slides into the list

**Business mergers:**
- Combine two same-tier businesses for one of the next tier, sacrificing both. Creates a meaningful late-game decision tree.

### 5.3 Investing Tab — Volatile Yield

**Purpose:** depth + risk for engaged players.

**Sub-tabs at top:** `Shares · Real Estate · Cryptocurrency`

#### Shares
- "My stock portfolio" hero card (value, all-time PnL %, estimated yield/hr)
- **Stock market list:** ticker, company icon, current price, sparkline, 1h change %
- Tap stock → detail with full chart (1h / 1d / 7d / 30d), buy/sell panel, dividend yield, volatility rating (1–5 stars)
- **Stable income** carousel: high-dividend stocks (e.g., AD&D 5.32%)
- **Growth potential** carousel: high-volatility / high-upside tickers
- Order book is *simulated* — prices follow a daily sine + random walk seeded by a server-style RNG so all players see roughly the same market

#### Real Estate
- Property list cards with photo, address, monthly rent, appreciation %, occupancy
- Buy → property earns rent per hour, can be sold for current market value
- Tiers: Studio → Apartment → House → Penthouse → Hotel → Skyscraper
- Maintenance cost (deducted hourly) introduces a small drag

#### Cryptocurrency
- Highest volatility, highest possible yield
- 5–8 fictional coins (BitCorn, EtherEum, DogeMoon, etc.) with very different volatility profiles
- Staking option: lock crypto for X hours for guaranteed yield
- A market crash event (random, ~once per week) can erase 30–70% of crypto value — designed to teach diversification

### 5.4 Earnings Tab — Tap-to-Earn

**Purpose:** the "fidget" surface. Players bounce here for active engagement.

- **Account card** (top): 4-digit card number, expiry, big balance, premium "**New**" chip if active
- **Earnings card:** "$6.72 per click", current level (3), progress bar to next level, next-level reward preview
- **Ad boost card:** "$43.61 per click for 30s" (rewarded ad)
- **Tap zone (big empty area):** floating finger icon, ripple effect on tap, particle burst, haptic on every tap
- **Level-up reveal:** full-screen animation when leveling up (Skia confetti + Reanimated scale-in)
- **Daily tap cap:** to avoid carpal-tunnel exploitation, hard cap on taps/day; cap raises with VIP

> **Design rule:** the Earnings tab is the ONLY place we use big juicy game-style animations. Other tabs stay calm and fintech-clean.

### 5.5 Items Tab — Trophies & Collections

**Purpose:** show-off / completionist hook.

**Top: 3 hero tiles** (Garage, Hangar, Harbor) with photographic hero images. Tap → enters that asset category screen.
- **Garage:** cars (compact → sports → supercar → hypercar)
- **Hangar:** aircraft (Cessna → private jet → airliner)
- **Harbor:** yachts and superyachts

Each owned item shows the photo, name, valuation, "since you bought it +12%". Items appreciate over time, so they double as a long-term store of value.

**Shop strip:** quick-link cards to Car Showroom / Aircraft Shop / Yacht Shop.

**Collections grid:**
- Coins (0/20), Paintings (0/25), Unique items (0/5), Retro cars (0/20), Crowns (0/8), Trading cards (0/30)
- Collections are bought from random drops (purchase a "Coin pack" for $50k, get a random coin) or earned through achievements
- Completing a set = permanent passive bonus (e.g., +5% businesses income forever)

**Item detail page:** photo carousel, valuation history chart, sell button (with confirmation — selling rare items is irreversible).

---

## 6. Cross-Cutting Systems

### 6.1 Money & Number Display

- Internal representation: **`decimal.js` Decimal** everywhere money is touched. Never `number`. Never `BigInt` (lacks fractions). Stored as strings in WatermelonDB.
- Display rules:
  - `< $1,000` → `$123.45` (2 dp)
  - `$1,000 – $999,999` → `$12,345` or `$123.4k`
  - `$1M – $999M` → `$1.1M`, `$12.4M`
  - `≥ $1B` → `$1.2B`, `$3.45T`, `$1.2Qa`, `$45Qi` (use short scale + suffix table)
- A `formatMoney()` util in [src/lib/money.ts](src/lib/money.ts) is the only place these rules live.

### 6.2 Time & Offline Progression

- **Authoritative clock:** `Date.now()` on app start, plus a server-time check (if reachable) to detect device-clock cheating.
- On every state change, persist `lastTickAt` (epoch ms) and current income rates.
- On app open:
  1. Compute `elapsed = now - lastTickAt`, capped at **8 hours** (free) / **24 hours** (VIP)
  2. For each income source, accrue `rate × elapsed`
  3. Show offline-earnings modal: total earned, breakdown by source, "Collect" button with rewarded-ad "Double it" option
- Foreground tick: every 1s, recompute income rates and bump balance (no per-frame work).

> Note: the 8h cap is intentional friction — it nudges players to open the app daily without feeling like a chore.

### 6.3 Taxes

- Simple model: a fixed percentage (e.g., 12%) of income earned since last payment.
- Tax bill grows visibly in the Profile tab. If unpaid past the due date, a 25% income debuff kicks in.
- Pay-all-taxes = instant deduction from balance. Optional "Tax accountant" IAP automates payments.

### 6.4 Levels & Prestige

- **Player level:** increments with milestone networth ($10k, $100k, $1M, …). Each level grants +1% global income, cosmetic title, and unlocks (e.g., crypto unlocks at lvl 8).
- **Prestige ("New Generation"):**
  - Available after networth ≥ $1B
  - Resets: businesses, stocks, crypto, real estate, balance, current managers
  - Keeps: collections, prestige stars, achievements, VIP, residence
  - Grants: 1 "Empire Star" per $1B at prestige. Each star = +2% income forever. Cap at 50 stars/run to prevent runaway growth.

### 6.5 Achievements

- Bronze / silver / gold tiers across categories (Business, Investing, Tap, Collections, Time-played)
- Each achievement = small one-time cash reward + cosmetic badge on Profile
- Non-grindy: ~120 achievements total, designed to unlock organically over 30–60 hours of play

### 6.6 Random Events ("News Ticker")

- Top of every screen: a thin marquee bar with news events ("Tech stocks surge +12%", "Crypto crash imminent", "Tax holiday this weekend")
- Some events are pure flavor, some have mechanical effects (multiplier on a sector for 1h)
- Adds liveness without being a notification spam channel

### 6.7 Sound & Haptics

- **Haptic** on every meaningful tap (Expo Haptics: light for taps, medium for buys, heavy for level-up/prestige)
- **Sound** is optional, off by default. SFX pack for: coin pickup, level up, purchase, prestige, market crash
- No music in MVP (battery + dev cost)

---

## 7. UI/UX Design System

### 7.1 Visual Language

**Palette** — light mode (dark mode mirrored):
- Background: `#F7F8FA` (off-white, not pure)
- Surface: `#FFFFFF`
- Surface elevated: `#FFFFFF` with `box-shadow: 0 2 8 rgba(15, 23, 42, 0.06)`
- Primary: `#2F6BFF` (electric blue) — used for primary actions and the active tab
- Success / income: `#10B981` (emerald)
- Danger / loss: `#EF4444` (coral)
- Premium / VIP: `#F5B100` (gold), used sparingly
- Text primary: `#0F172A`
- Text secondary: `#64748B`
- Text tertiary: `#94A3B8`

**Category accents** (left-edge bars on cards) match the reference app's 8-color system but with tuned saturation. Defined in [src/theme/categories.ts](src/theme/categories.ts).

### 7.2 Typography

- **Display** (networth headline): SF Pro / Inter, 40pt, weight 700, tight letter-spacing
- **Headline** (card values): 22pt, weight 600
- **Body**: 15pt, weight 400
- **Caption** (labels): 13pt, weight 500, letter-spacing +0.4
- **Mono** (numbers in tables): JetBrains Mono / SF Mono — only in stock/crypto lists for vertical alignment

### 7.3 Spacing & Radius

- 4pt base grid (4, 8, 12, 16, 24, 32, 48)
- Card radius: 16
- Pill / chip radius: 999 (fully rounded)
- Modal sheet radius: 24 (top corners only)

### 7.4 Motion

Three motion tiers — used deliberately:

1. **Calm fintech** (Profile, Business list, Investing, Items): 200–300ms ease-out fades, gentle slide-up, no bounce. Hierarchy via opacity + 4pt offset.
2. **Game energy** (Earnings tap, level-up, purchase confirm): scale springs (1 → 1.1 → 1), particle bursts via Skia, confetti on milestones.
3. **Drama** (prestige, market crash, jackpot achievement): full-screen takeover, slow zoom, ambient particle field, 1–2 seconds.

We **never** use tier 2/3 motion on tier 1 surfaces. The user should feel "this is a serious money app" first, "this is a game" second.

### 7.5 Component Library

Custom components (in [src/components/](src/components/)):
- `<NetworthCard />` — headline number + delta chip
- `<AssetCard />` — color-bar + label + value + chevron
- `<MoneyText />` — animated count-up, locale-aware, suffix-aware
- `<Sparkline />` — Skia line chart, no axes, color-shifts on positive/negative
- `<PriceChart />` — full Skia chart with timeframe selector
- `<BusinessRow />` — icon + name + progress + $/hr + chevron
- `<UpgradeButton />` — quantity-tier (×1 / ×10 / ×100 / Max), cost preview, affordability state
- `<TapZone />` — gesture-handled tap area with ripple + haptic + particle
- `<NewsTicker />` — marquee with auto-scroll
- `<RewardedAdBoostCard />` — branded "watch ad" CTA with cooldown
- `<OfflineEarningsModal />` — bottom sheet with collect + double-with-ad
- `<EmptyState />` — illustration + one-line CTA (zero "$0.00" surfaces)

### 7.6 Accessibility

- Minimum tap target 44×44pt
- Color is never the only signal (icons accompany red/green deltas)
- Dynamic Type scaling supported for body & caption
- Reduce-Motion honored — disables tier 2/3 motion
- VoiceOver labels on every card, numbers read as "one point one million dollars" not "dollar one point one M"

---

## 8. Technical Architecture

### 8.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Expo SDK 55+** (React Native 0.79+) | Single codebase, OTA updates, mature library ecosystem |
| Language | **TypeScript** strict | Catch number/string confusion at compile time |
| Navigation | **Expo Router v4** (file-based) | Lower boilerplate than React Navigation, type-safe routes |
| State | **Zustand** + **Immer** | Tiny, no boilerplate, works great with selectors |
| Persistence (game state) | **WatermelonDB** (SQLite) | Structured tables for businesses, holdings, transactions; reactive queries |
| Persistence (settings / fast K/V) | **react-native-mmkv** | 30× faster than AsyncStorage; for cursors, last-tick timestamps, prefs |
| Animations | **Reanimated 3** + **Moti** | Native-thread animations; declarative API |
| Custom drawing | **React Native Skia** | Charts, particles, the tap-zone ripple, level-up confetti |
| Gestures | **React Native Gesture Handler** | Tap-to-earn, swipeable cards |
| Money math | **decimal.js** | Arbitrary precision; avoids float drift |
| Ads | **react-native-google-mobile-ads** | AdMob banner + rewarded + interstitial |
| IAP / subscription | **react-native-purchases** (RevenueCat) | Cross-platform IAP with one entitlement source |
| Haptics | **expo-haptics** | Built-in |
| Notifications | **expo-notifications** | "Your taxes are due", "Stock alert" |
| Crash & analytics | **Sentry** + **PostHog** | Both have generous free tiers |

### 8.2 Folder Structure

```
EmpireState/
├── app/                          # Expo Router routes
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar
│   │   ├── investing.tsx
│   │   ├── business.tsx
│   │   ├── earnings.tsx
│   │   ├── items.tsx
│   │   └── profile.tsx
│   ├── business/[id].tsx        # Business detail
│   ├── stock/[ticker].tsx
│   ├── property/[id].tsx
│   ├── crypto/[symbol].tsx
│   ├── item/[id].tsx
│   ├── prestige.tsx             # Full-screen prestige flow
│   └── _layout.tsx              # Root layout, providers
├── src/
│   ├── components/              # Reusable UI (see §7.5)
│   ├── theme/                   # Colors, type, spacing, motion presets
│   ├── lib/
│   │   ├── money.ts             # formatMoney, parseMoney, Decimal helpers
│   │   ├── time.ts              # offline-tick math
│   │   ├── rng.ts               # Seeded RNG for market events
│   │   ├── haptics.ts
│   │   └── analytics.ts
│   ├── game/
│   │   ├── economy/
│   │   │   ├── businesses.ts    # Business templates & cost curves
│   │   │   ├── stocks.ts        # Ticker simulation
│   │   │   ├── crypto.ts
│   │   │   ├── realestate.ts
│   │   │   └── tax.ts
│   │   ├── progression/
│   │   │   ├── levels.ts
│   │   │   ├── prestige.ts
│   │   │   └── achievements.ts
│   │   ├── events/              # Random events / news
│   │   └── tick.ts              # The master tick loop
│   ├── store/                   # Zustand slices
│   │   ├── balance.ts
│   │   ├── businesses.ts
│   │   ├── portfolio.ts
│   │   └── settings.ts
│   ├── db/                      # WatermelonDB schema + models
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   └── models/
│   ├── ads/                     # AdMob wrappers, rewarded-ad hooks
│   ├── iap/                     # RevenueCat wrappers
│   └── content/                 # Static config (business templates, items, achievements)
│       ├── businesses.json
│       ├── stocks.json
│       ├── items.json
│       └── achievements.json
├── assets/                      # Images, fonts, lottie, sounds
└── DESIGN.md                    # this file
```

### 8.3 The Tick Loop

A single deterministic function `tick(state, deltaMs)` in [src/game/tick.ts](src/game/tick.ts) is the source of truth. It:

1. Walks every income source, accrues `rate × deltaMs / 3600000` (per-hour rate)
2. Applies global multipliers (prestige stars, VIP, active boosts)
3. Updates stock/crypto prices (Brownian motion with mean reversion)
4. Decrements active boost timers
5. Returns the new state (Immer-produced, immutable)

This runs:
- **Once on app open** with `deltaMs = now - lastTickAt` (capped at 8h / 24h VIP)
- **Every 1s in foreground** via a `setInterval`, with `deltaMs = 1000`
- **Never in background** — we rely on delta-time on resume instead of timers, because iOS will kill background work anyway

### 8.4 Economy Numbers (initial values, for balance tuning)

> All numbers are tuning starting points; expect 2–3 balance passes after playtesting.

**Business cost curve:** `cost(level) = baseCost × 1.07^level`
**Business income curve:** `income(level) = baseIncome × 1.10^level`
**Effect:** ratio drifts ~3% per level → optimal upgrade-then-wait cadence.

**Sample first 6 businesses:**

| Tier | Name | Unlock | Base cost | Base $/hr | Max level |
|---|---|---|---|---|---|
| 1 | Lemonade Stand | $0 | $10 | $1 | 100 |
| 2 | Food Truck | $500 | $250 | $20 | 100 |
| 3 | Coffee Shop | $5k | $5,000 | $400 | 100 |
| 4 | Taxi Company | $50k | $50,000 | $4k | 100 |
| 5 | IT Startup | $500k | $500k | $40k | 100 |
| 6 | Factory | $5M | $5M | $400k | 100 |
| … | … | … | … | … | … |

Continue exponentially through ~20 tiers, ending at "Global Conglomerate" at $1Qa unlock.

**Manager unlock cost:** 5× the business's level-10 upgrade cost.

**Stocks:** 20 fictional tickers, 5 per sector. Each has `base_price`, `volatility` (0.05–0.5), `drift` (-0.02–+0.05/day), `dividend_yield` (0–8%). Daily random walk seeded by date so all players see the same market.

**Prestige currency formula:** `stars = floor(networth / 1B)` capped at 50/run.

### 8.5 Persistence Strategy

**WatermelonDB tables:**
- `businesses` (id, name, level, lastCollectedAt, hasManager)
- `holdings` (id, type: stock|crypto, ticker, quantity, avgCost)
- `properties` (id, type, purchasePrice, purchaseDate)
- `items` (id, type, catalogId, purchasePrice, purchaseDate)
- `collections_progress` (collectionId, itemId, ownedAt)
- `transactions` (id, ts, type, amount, note) — for stats
- `achievements_unlocked` (id, ts)

**MMKV keys:**
- `balance` (Decimal string)
- `lastTickAt` (epoch ms)
- `prestigeStars` (int)
- `settings.*` (sound, haptics, notifications, theme)
- `boosts.*` (active boost end-timestamps)

**On every app close / blur:** flush MMKV (already synchronous). WatermelonDB writes are batched on action.

**No cloud sync in MVP.** Architecture allows adding a sync engine later (RevenueCat user IDs can double as identity).

### 8.6 Ads Integration

- **AdMob** via `react-native-google-mobile-ads`
- **Banner:** anchored at the bottom of Profile and Earnings tabs ONLY (never on Business / Investing detail screens — those are conversion-critical)
- **Rewarded:** the only "always available" ad type. Used for:
  - "Double offline earnings"
  - "+30% income for 4h"
  - "Extra tap-zone multiplier for 30s"
  - "Free coin pack roll"
- **Interstitial:** sparingly — once per 5 minutes max, only after non-critical screens (e.g., closing an item detail). Never on app open. Never blocking gameplay.
- **Remove-ads IAP:** disables banner + interstitial. Keeps rewarded ads available (they grant rewards).
- Ad-frequency caps configured server-side via RevenueCat custom attributes so we can tune without an app update.

### 8.7 IAP & Subscription

Via RevenueCat (`react-native-purchases`):

**Entitlements:**
- `no_ads` — one-time purchase ($3.99). Disables banner + interstitial.
- `vip_monthly` — subscription ($4.99/mo). Includes: no ads, 24h offline cap (vs 8h), 2× tap-zone, exclusive cosmetic items, monthly currency stipend.
- `vip_yearly` — $39.99/yr (33% off).

**Consumable currency packs:**
- $0.99 — small cash injection
- $4.99 — medium
- $9.99 — large
- $19.99 — XL
- $49.99 — "Tycoon Pack" (currency + 5 prestige stars + cosmetic)

Server-side receipt validation handled by RevenueCat. We never trust the client.

---

## 9. Build Phases & Roadmap

### Phase 0 — Foundations (Week 1)
- Expo + TypeScript scaffold, ESLint, Prettier
- Theme system (colors, type, spacing, motion presets)
- 5-tab navigation with empty screens
- MMKV + WatermelonDB wired, schema v1
- `MoneyText` and `formatMoney()` utility with unit tests
- Storybook (or simple gallery screen) for component review

### Phase 1 — Core Loop (Weeks 2–3)
- Tick loop + offline accrual modal
- Business tab: list, detail, buy, upgrade, manager
- Earnings tab: tap-to-earn, level-up
- Profile tab: networth dashboard (basic)
- 6 starter businesses tuned for first 2 hours of play

### Phase 2 — Investing & Items (Weeks 4–5)
- Stocks: list, detail, buy/sell, sparklines (Skia)
- Crypto: same surface, different curves
- Real estate: list, buy, hourly rent collection
- Items: Garage / Hangar / Harbor + Collections grid

### Phase 3 — Polish & Systems (Week 6)
- Achievements, news ticker, random events
- Taxes mechanic
- Prestige flow
- All motion polish (tier 1/2/3 audit)
- Sound pack (optional toggle)
- Haptics audit

### Phase 4 — Monetization (Week 7)
- AdMob integration (banner + rewarded + interstitial caps)
- RevenueCat: no-ads, VIP, currency packs
- Offline-earnings "double with ad" CTA
- Boost-with-ad surfaces across the app

### Phase 5 — Beta & Live Ops Prep (Week 8)
- TestFlight + Google Play closed testing
- Sentry + PostHog wired
- Balance tuning based on first 20 testers
- Accessibility pass (VoiceOver, Reduce Motion, Dynamic Type)
- Onboarding flow (3-screen tutorial)

### Phase 6 — Launch (Week 9–10)
- App Store + Play Store submission
- Marketing landing page
- Press kit
- Soft-launch in a single country (Philippines or Brazil) to gather D1/D7 data
- Tune and re-submit before global launch

### Post-launch live ops (continuous)
- Weekly news-event content drops (server-driven JSON)
- New business tiers, items, collections every 2 weeks
- A/B testing on ad frequency caps and IAP price points
- Seasonal events (Black Friday, NYE)

---

## 10. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| **Number precision drift** in JS doing financial math | `decimal.js` everywhere; unit tests for `formatMoney` and tick math |
| **Device-clock cheating** for offline earnings | Cap at 8h / 24h; consider lightweight server time-check post-MVP |
| **Tab balance** — Investing tab too complex for casual players | Hide Investing tab behind level-3 unlock; gentle tutorial first time it's tapped |
| **Ad fatigue** killing D7 retention | Hard interstitial cap (1/5min); no ads on critical paths; "no ads" IAP visible early |
| **WatermelonDB migration headaches** on schema changes | Treat schema as append-only post-launch; migration tests in CI |
| **Skia bundle size** (~3MB) | Skia is worth the cost for charts + particles; lazy-load Skia screens |
| **App Store rejection** for "gambling-like" mechanics | No loot boxes; collection drops show probabilities; no real-money cash-out |
| **Memory growth** with thousands of transactions | Cap transaction history at 1,000 rows in UI; archive older to a "stats" rollup |

### Open product questions (to resolve before Phase 1)
1. Player name & avatar — do we want a custom avatar builder, or just initials on a colored circle for MVP?
2. Tutorial — guided overlay (Coachmark style) or "learn by clicking" with empty-state CTAs?
3. Should the Earnings tab be the default landing tab (currently true) or Business (more central to gameplay)?
4. Currency: USD only, or detect locale and use symbols (€, £, ¥) cosmetically with USD math underneath?

---

## 11. Success Metrics (post-launch)

- **D1 retention:** >40%
- **D7 retention:** >18%
- **D30 retention:** >6%
- **Median session length:** 4–6 minutes
- **Sessions per DAU:** 3–5
- **ARPDAU:** $0.05–$0.15 (mostly ads, with subscription tail)
- **IAP conversion (any purchase):** >2% of MAU
- **Crash-free sessions:** >99.5%

---

## 12. What This Document Is Not

This is a *design and build plan*, not a final spec. Open items in §10.4 must be answered before Phase 1. Economy numbers in §8.4 are starting points and will move after the first playtest. The 10-week roadmap assumes one full-time engineer + part-time designer; double the timeline for solo work or add staff to compress.

**Next step:** approve the plan, answer the four open product questions, then kick off Phase 0.
