import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Decimal from 'decimal.js';
import { router } from 'expo-router';
import { useGame, aggregateRentPerHour, computeNetworth } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { formatMoney, formatPercent, M } from '../../src/lib/money';
import { getAllStocks, getAllCryptos, StockSnapshot, CryptoSnapshot } from '../../src/game/market';
import { Sparkline } from '../../src/components/Sparkline';
import { PROPERTIES } from '../../src/content/realEstate';

type Tab = 'shares' | 'real' | 'crypto';

export default function InvestingScreen() {
  const [tab, setTab] = useState<Tab>('shares');
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerWrap}>
        <Text style={styles.heading}>Investing</Text>
        <View style={styles.tabsRow}>
          <TabBtn label="Shares" active={tab === 'shares'} onPress={() => setTab('shares')} />
          <TabBtn label="Real Estate" active={tab === 'real'} onPress={() => setTab('real')} />
          <TabBtn label="Crypto" active={tab === 'crypto'} onPress={() => setTab('crypto')} />
        </View>
      </View>
      {tab === 'shares' ? <SharesView /> : tab === 'real' ? <RealEstateView /> : <CryptoView />}
    </SafeAreaView>
  );
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active ? <View style={styles.tabUnderline} /> : null}
    </Pressable>
  );
}

// ─── Shares ────────────────────────────────────────────────────────────────────

function SharesView() {
  const state = useGame((s) => s.state);
  const bottomPad = useBottomPadding();
  const networth = useMemo(() => computeNetworth(state), [state]);
  const snapshots: StockSnapshot[] = useMemo(() => getAllStocks(), []);
  const visibleSnaps = snapshots.filter((s) => M(networth).gte(s.template.unlockNetworth));

  const portfolio = useMemo(() => {
    let total = new Decimal(0);
    let cost = new Decimal(0);
    let dividendsPerHour = new Decimal(0);
    for (const owned of Object.values(state.stocks)) {
      const snap = snapshots.find((s) => s.ticker === owned.ticker);
      const price = snap?.price ?? 0;
      total = total.plus(new Decimal(price).times(owned.quantity));
      cost = cost.plus(new Decimal(owned.avgCost).times(owned.quantity));
      if (snap) {
        const yearly = new Decimal(snap.price).times(owned.quantity).times(snap.template.dividendYield);
        dividendsPerHour = dividendsPerHour.plus(yearly.div(365 * 24));
      }
    }
    const pl = total.minus(cost);
    const plPct = cost.gt(0) ? pl.div(cost).times(100) : new Decimal(0);
    return { total, pl, plPct, dividendsPerHour };
  }, [state.stocks, snapshots]);

  const stable = visibleSnaps.filter((s) => s.template.dividendYield > 0.03).slice(0, 3);
  const growth = visibleSnaps.filter((s) => s.template.volatility > 0.18).slice(0, 3);

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
      <Pressable style={styles.portfolioCard} onPress={() => router.push('/investing/portfolio' as any)}>
        <LinearGradient colors={['#2563EB', '#1D4ED8']} style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]} />
        <View style={styles.portfolioHeader}>
          <Ionicons name="briefcase" size={18} color="#FFFFFF" />
          <Text style={styles.portfolioTitle}>My stock portfolio</Text>
          <View style={styles.portfolioArrow}>
            <Ionicons name="chevron-forward" size={16} color={palette.primary} />
          </View>
        </View>
        <Text style={styles.portfolioLabel}>Total portfolio value</Text>
        <Text style={styles.portfolioValue}>{formatMoney(portfolio.total)}</Text>
        <Text style={[styles.portfolioPnL, portfolio.pl.gte(0) ? styles.pnlPositive : styles.pnlNegative]}>
          {portfolio.pl.gte(0) ? '+' : ''}{formatMoney(portfolio.pl)} ({formatPercent(portfolio.plPct)}) all-time
        </Text>
        <View style={styles.portfolioYieldRow}>
          <Ionicons name="trending-up-outline" size={14} color="#BFD3FF" />
          <Text style={styles.portfolioYieldLabel}>Dividend yield</Text>
          <Text style={styles.portfolioYieldValue}>{formatMoney(portfolio.dividendsPerHour)}/hr</Text>
        </View>
      </Pressable>

      <Pressable style={styles.marketCta} onPress={() => router.push('/investing/stocks' as any)}>
        <View>
          <Text style={styles.marketCtaTitle}>Stock market</Text>
          <Text style={styles.marketCtaSubtitle}>View all {visibleSnaps.length} available stocks</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </Pressable>

      <SectionTitle icon="leaf-outline" title="Stable income" subtitle="Highest dividend yields" />
      {stable.map((s) => (
        <StockRow key={s.ticker} snap={s} ownedQty={state.stocks[s.ticker]?.quantity ?? 0} />
      ))}

      <SectionTitle icon="flame-outline" title="Growth potential" subtitle="High-volatility — bigger upside" />
      {growth.map((s) => (
        <StockRow key={s.ticker} snap={s} ownedQty={state.stocks[s.ticker]?.quantity ?? 0} />
      ))}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function StockRow({ snap, ownedQty }: { snap: StockSnapshot; ownedQty: number }) {
  const up = snap.changePct >= 0;
  return (
    <Pressable style={styles.stockRow} onPress={() => router.push(`/investing/stock/${snap.ticker}` as any)}>
      <View style={[styles.stockTickerCircle, { backgroundColor: snap.template.color + '22' }]}>
        <Text style={[styles.stockTickerText, { color: snap.template.color }]}>{snap.ticker.slice(0, 2)}</Text>
      </View>
      <View style={styles.stockBody}>
        <Text style={styles.stockTicker}>{snap.ticker}</Text>
        <Text style={styles.stockName}>{snap.template.name}</Text>
      </View>
      <View style={styles.stockMid}>
        <Sparkline data={snap.series} width={56} height={22} color={up ? palette.success : palette.danger} showFill={false} />
      </View>
      <View style={styles.stockRight}>
        <Text style={styles.stockPrice}>{formatMoney(snap.price)}</Text>
        <Text style={[styles.stockChange, { color: up ? palette.success : palette.danger }]}>
          {up ? '▲' : '▼'} {Math.abs(snap.changePct).toFixed(2)}%
        </Text>
        {ownedQty > 0 ? <Text style={styles.ownedBadge}>{ownedQty} owned</Text> : null}
      </View>
    </Pressable>
  );
}

// ─── Real Estate ───────────────────────────────────────────────────────────────

function RealEstateView() {
  const state = useGame((s) => s.state);
  const bottomPad = useBottomPadding();
  const rentPerHour = aggregateRentPerHour(state);
  const networth = useMemo(() => computeNetworth(state), [state]);
  const unlocked = PROPERTIES.filter((p) => M(networth).gte(p.unlockNetworth));
  const locked = PROPERTIES.length - unlocked.length;
  const owned = state.properties;

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
      {/* Total rent card */}
      <LinearGradient colors={['#065F46', '#047857']} style={[styles.rentCard, { borderRadius: radius.xl }]}>
        <View style={styles.rentCardTop}>
          <Ionicons name="home" size={20} color="#A7F3D0" />
          <Text style={styles.rentCardTitle}>Real Estate Income</Text>
        </View>
        <Text style={styles.rentCardValue}>{formatMoney(rentPerHour)}</Text>
        <Text style={styles.rentCardLabel}>Total rental income per hour</Text>
        <View style={styles.rentCardFooter}>
          <View style={styles.rentStat}>
            <Text style={styles.rentStatNum}>{owned.length}</Text>
            <Text style={styles.rentStatLbl}>Properties owned</Text>
          </View>
          <View style={styles.rentStatDivider} />
          <View style={styles.rentStat}>
            <Text style={styles.rentStatNum}>{formatMoney(M(rentPerHour).times(24))}</Text>
            <Text style={styles.rentStatLbl}>Per day</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Action cards */}
      <View style={styles.reActionRow}>
        <Pressable style={[styles.reCard, { flex: 1 }]} onPress={() => router.push('/investing/buy-property' as any)}>
          <View style={styles.reCardImg}>
            <Ionicons name="search" size={28} color={palette.primary} />
          </View>
          <Text style={styles.reCardTitle}>Real Estate{'\n'}Market</Text>
          <Text style={styles.reCardSub}>Buy properties{'\n'}all over the world</Text>
          <View style={styles.reCardChevron}>
            <Ionicons name="chevron-forward" size={14} color={palette.primary} />
          </View>
        </Pressable>

        <Pressable style={[styles.reCard, { flex: 1 }]} onPress={() => router.push('/investing/my-property' as any)}>
          <View style={[styles.reCardImg, { backgroundColor: palette.successSoft }]}>
            <Ionicons name="home" size={28} color={palette.success} />
          </View>
          <Text style={styles.reCardTitle}>My{'\n'}Properties</Text>
          <Text style={styles.reCardSub}>{owned.length} properties{'\n'}in your portfolio</Text>
          <View style={[styles.reCardChevron, { backgroundColor: palette.successSoft }]}>
            <Ionicons name="chevron-forward" size={14} color={palette.success} />
          </View>
        </Pressable>
      </View>

      {/* Top unlocked properties preview */}
      {unlocked.slice(0, 3).map((prop) => {
        const isOwned = owned.some((o) => o.templateId === prop.id);
        return (
          <Pressable
            key={prop.id}
            style={styles.propPreviewRow}
            onPress={() => router.push('/investing/buy-property' as any)}
          >
            <Image source={{ uri: prop.imageUrl }} style={styles.propPreviewImg} resizeMode="cover" />
            <View style={styles.propPreviewBody}>
              <Text style={styles.propPreviewName}>{prop.name}</Text>
              <View style={styles.propPreviewLoc}>
                <Ionicons name="location-outline" size={12} color={palette.textTertiary} />
                <Text style={styles.propPreviewLocText}>{prop.city}, {prop.country}</Text>
              </View>
              <Text style={styles.propPreviewRent}>{formatMoney(prop.rentPerHour)}/hr rental</Text>
            </View>
            <View style={styles.propPreviewRight}>
              <Text style={styles.propPreviewPrice}>{formatMoney(prop.price)}</Text>
              {isOwned ? (
                <View style={styles.ownedPill}><Text style={styles.ownedPillText}>Owned</Text></View>
              ) : (
                <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} />
              )}
            </View>
          </Pressable>
        );
      })}

      {locked > 0 ? (
        <View style={styles.lockedHint}>
          <Ionicons name="lock-closed-outline" size={14} color={palette.textTertiary} />
          <Text style={styles.lockedText}>{locked} more properties unlock as your net worth grows</Text>
        </View>
      ) : null}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

// ─── Crypto ────────────────────────────────────────────────────────────────────

function CryptoView() {
  const state = useGame((s) => s.state);
  const bottomPad = useBottomPadding();
  const networth = useMemo(() => computeNetworth(state), [state]);
  const snapshots: CryptoSnapshot[] = useMemo(() => getAllCryptos(), []);
  const visible = snapshots.filter((c) => M(networth).gte(c.template.unlockNetworth));
  const locked = snapshots.length - visible.length;

  const portfolio = useMemo(() => {
    let total = new Decimal(0);
    let cost = new Decimal(0);
    for (const owned of Object.values(state.cryptos)) {
      const snap = snapshots.find((s) => s.symbol === owned.symbol);
      const price = snap?.price ?? 0;
      total = total.plus(new Decimal(price).times(owned.quantity));
      cost = cost.plus(new Decimal(owned.avgCost).times(owned.quantity));
    }
    return { total, pl: total.minus(cost), plPct: cost.gt(0) ? total.minus(cost).div(cost).times(100) : new Decimal(0) };
  }, [state.cryptos, snapshots]);

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
      <View style={styles.cryptoPortfolioCard}>
        <View style={styles.cryptoPortfolioLeft}>
          <Text style={styles.cryptoPortfolioLabel}>Crypto portfolio</Text>
          <Text style={styles.cryptoPortfolioValue}>{formatMoney(portfolio.total)}</Text>
          <Text style={[styles.cryptoPortfolioPl, portfolio.pl.gte(0) ? styles.pnlPositive : styles.pnlNegative]}>
            {portfolio.pl.gte(0) ? '+' : ''}{formatPercent(portfolio.plPct)} all-time
          </Text>
        </View>
        <View style={styles.cryptoPortfolioRight}>
          <Ionicons name="logo-bitcoin" size={40} color="#F59E0B" />
        </View>
      </View>

      {Object.keys(state.cryptos).length > 0 ? (
        <>
          <Text style={styles.listHeader}>Your holdings · {Object.keys(state.cryptos).length}</Text>
          {Object.values(state.cryptos).map((owned) => {
            const snap = snapshots.find((s) => s.symbol === owned.symbol);
            if (!snap) return null;
            const value = new Decimal(snap.price).times(owned.quantity);
            const cost = new Decimal(owned.avgCost).times(owned.quantity);
            const pl = value.minus(cost);
            const plPct = cost.gt(0) ? pl.div(cost).times(100) : new Decimal(0);
            const up = pl.gte(0);
            const priceStr = snap.price < 1 ? snap.price.toFixed(4) : snap.price.toFixed(2);
            return (
              <Pressable key={`held-${owned.symbol}`} style={styles.stockRow} onPress={() => router.push(`/investing/crypto/${owned.symbol}` as any)}>
                <View style={[styles.stockTickerCircle, { backgroundColor: snap.template.color + '22' }]}>
                  <Text style={[styles.stockTickerText, { color: snap.template.color }]}>{owned.symbol.slice(0, 2)}</Text>
                </View>
                <View style={styles.stockBody}>
                  <Text style={styles.stockTicker}>{owned.symbol}</Text>
                  <Text style={styles.stockName}>{owned.quantity.toFixed(4)} · {formatMoney(value)}</Text>
                </View>
                <View style={styles.stockMid}>
                  <Sparkline data={snap.series} width={56} height={22} color={up ? palette.success : palette.danger} showFill={false} />
                </View>
                <View style={styles.stockRight}>
                  <Text style={styles.stockPrice}>${priceStr}</Text>
                  <Text style={[styles.stockChange, { color: up ? palette.success : palette.danger }]}>
                    {up ? '▲' : '▼'} {Math.abs(plPct.toNumber()).toFixed(2)}%
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </>
      ) : null}

      <Text style={styles.listHeader}>Markets · {visible.length} available</Text>
      {visible.map((c) => {
        const owned = state.cryptos[c.symbol];
        const up = c.changePct >= 0;
        const priceStr = c.price < 1 ? c.price.toFixed(4) : c.price.toFixed(2);
        return (
          <Pressable key={c.symbol} style={styles.stockRow} onPress={() => router.push(`/investing/crypto/${c.symbol}` as any)}>
            <View style={[styles.stockTickerCircle, { backgroundColor: c.template.color + '22' }]}>
              <Text style={[styles.stockTickerText, { color: c.template.color }]}>{c.symbol.slice(0, 2)}</Text>
            </View>
            <View style={styles.stockBody}>
              <Text style={styles.stockTicker}>{c.symbol}</Text>
              <Text style={styles.stockName}>{c.template.name}</Text>
            </View>
            <View style={styles.stockMid}>
              <Sparkline data={c.series} width={56} height={22} color={up ? palette.success : palette.danger} showFill={false} />
            </View>
            <View style={styles.stockRight}>
              <Text style={styles.stockPrice}>${priceStr}</Text>
              <Text style={[styles.stockChange, { color: up ? palette.success : palette.danger }]}>
                {up ? '▲' : '▼'} {Math.abs(c.changePct).toFixed(2)}%
              </Text>
              {owned ? <Text style={styles.ownedBadge}>{owned.quantity.toFixed(4)}</Text> : null}
            </View>
          </Pressable>
        );
      })}

      {locked > 0 ? (
        <View style={styles.lockedHint}>
          <Ionicons name="lock-closed-outline" size={14} color={palette.textTertiary} />
          <Text style={styles.lockedText}>{locked} more coins unlock as your net worth grows</Text>
        </View>
      ) : null}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={16} color={palette.primary} />
        <Text style={styles.sectionTitleText}>{title}</Text>
      </View>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  heading: { ...typography.hero, color: palette.textPrimary },
  tabsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.border },
  tabBtn: { paddingVertical: spacing.md, position: 'relative' },
  tabBtnActive: {},
  tabLabel: { ...typography.bodyMedium, color: palette.textSecondary },
  tabLabelActive: { color: palette.primary, fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: palette.primary, borderRadius: 1 },
  content: { padding: spacing.lg, gap: spacing.md },

  // Portfolio card
  portfolioCard: { borderRadius: radius.xl, padding: spacing.lg, ...shadow.card, overflow: 'hidden', minHeight: 160 },
  portfolioHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  portfolioTitle: { ...typography.bodyMedium, color: '#FFFFFF', flex: 1 },
  portfolioArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  portfolioLabel: { ...typography.caption, color: '#BFD3FF' },
  portfolioValue: { ...typography.display, color: '#FFFFFF', marginTop: 2 },
  portfolioPnL: { ...typography.caption, marginTop: 2 },
  pnlPositive: { color: '#86EFAC' },
  pnlNegative: { color: '#FCA5A5' },
  portfolioYieldRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  portfolioYieldLabel: { ...typography.caption, color: '#BFD3FF', flex: 1 },
  portfolioYieldValue: { ...typography.bodyMedium, color: '#FFFFFF' },

  // Market CTA
  marketCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: '#3D85FE', borderRadius: radius.xl, ...shadow.card },
  marketCtaTitle: { ...typography.title, color: '#FFFFFF' },
  marketCtaSubtitle: { ...typography.caption, color: '#BFD3FF' },

  // Section titles
  sectionTitle: { marginTop: spacing.sm, gap: 2 },
  sectionTitleText: { ...typography.title, color: palette.textPrimary },
  sectionSubtitle: { ...typography.caption, color: palette.textSecondary, marginLeft: 24 },

  // Stock/Crypto rows
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  stockTickerCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stockTickerText: { ...typography.caption, fontWeight: '800' },
  stockBody: { flex: 1 },
  stockTicker: { ...typography.bodyMedium, color: palette.textPrimary },
  stockName: { ...typography.micro, color: palette.textTertiary },
  stockMid: { justifyContent: 'center' },
  stockRight: { alignItems: 'flex-end', minWidth: 80 },
  stockPrice: { ...typography.bodyMedium, color: palette.textPrimary },
  stockChange: { ...typography.caption },
  ownedBadge: { ...typography.micro, color: palette.primary, fontWeight: '700', marginTop: 2 },

  // Real estate
  rentCard: { padding: spacing.lg, borderRadius: radius.xl, ...shadow.card },
  rentCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  rentCardTitle: { ...typography.bodyMedium, color: '#A7F3D0' },
  rentCardValue: { ...typography.display, color: '#FFFFFF' },
  rentCardLabel: { ...typography.caption, color: '#6EE7B7', marginTop: 2 },
  rentCardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  rentStat: { flex: 1, alignItems: 'center' },
  rentStatNum: { ...typography.title, color: '#FFFFFF' },
  rentStatLbl: { ...typography.micro, color: '#6EE7B7', marginTop: 2 },
  rentStatDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  reActionRow: { flexDirection: 'row', gap: spacing.md },
  reCard: { backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card, gap: spacing.xs },
  reCardImg: { width: 52, height: 52, borderRadius: radius.lg, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  reCardTitle: { ...typography.title, color: palette.textPrimary },
  reCardSub: { ...typography.micro, color: palette.textSecondary, marginTop: 2 },
  reCardChevron: { width: 24, height: 24, borderRadius: 12, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: spacing.sm },

  propPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  propPreviewImg: { width: 88, height: 72 },
  propPreviewBody: { flex: 1, paddingVertical: spacing.sm },
  propPreviewName: { ...typography.bodyMedium, color: palette.textPrimary },
  propPreviewLoc: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  propPreviewLocText: { ...typography.micro, color: palette.textTertiary },
  propPreviewRent: { ...typography.caption, color: palette.success, marginTop: 2 },
  propPreviewRight: { paddingRight: spacing.md, alignItems: 'flex-end', gap: 6 },
  propPreviewPrice: { ...typography.bodyMedium, color: palette.textPrimary },
  ownedPill: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: palette.successSoft, borderRadius: radius.pill },
  ownedPillText: { ...typography.micro, color: palette.success, fontWeight: '700' },

  // Crypto portfolio
  cryptoPortfolioCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.xl, ...shadow.card },
  cryptoPortfolioLeft: { flex: 1 },
  cryptoPortfolioLabel: { ...typography.caption, color: palette.textSecondary },
  cryptoPortfolioValue: { ...typography.display, color: palette.textPrimary, marginTop: 2 },
  cryptoPortfolioPl: { ...typography.caption, marginTop: 2 },
  cryptoPortfolioRight: {},

  listHeader: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.sm },

  lockedHint: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.md, backgroundColor: palette.surfaceAlt, borderRadius: radius.md, justifyContent: 'center' },
  lockedText: { ...typography.caption, color: palette.textTertiary },
});
