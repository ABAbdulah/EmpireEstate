import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { formatMoney, formatPercent, M } from '../../src/lib/money';
import { getAllStocks, getAllCryptos, StockSnapshot, CryptoSnapshot } from '../../src/game/market';
import { Sparkline } from '../../src/components/Sparkline';
import Decimal from 'decimal.js';
import { router } from 'expo-router';

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
          <TabBtn label="Cryptocurrency" active={tab === 'crypto'} onPress={() => setTab('crypto')} />
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

function SharesView() {
  const state = useGame((s) => s.state);
  const snapshots: StockSnapshot[] = useMemo(() => getAllStocks(), []);
  const portfolio = useMemo(() => {
    let total = new Decimal(0);
    let cost = new Decimal(0);
    for (const owned of Object.values(state.stocks)) {
      const snap = snapshots.find((s) => s.ticker === owned.ticker);
      const price = snap?.price ?? 0;
      total = total.plus(new Decimal(price).times(owned.quantity));
      cost = cost.plus(new Decimal(owned.avgCost).times(owned.quantity));
    }
    const pl = total.minus(cost);
    const plPct = cost.gt(0) ? pl.div(cost).times(100) : new Decimal(0);
    let dividendsPerHour = new Decimal(0);
    for (const owned of Object.values(state.stocks)) {
      const snap = snapshots.find((s) => s.ticker === owned.ticker);
      if (!snap) continue;
      const yearly = new Decimal(snap.price).times(owned.quantity).times(snap.template.dividendYield);
      dividendsPerHour = dividendsPerHour.plus(yearly.div(365 * 24));
    }
    return { total, pl, plPct, dividendsPerHour };
  }, [state.stocks, snapshots]);

  const stable = snapshots.filter((s) => s.template.dividendYield > 0.03).slice(0, 3);
  const growth = snapshots.filter((s) => s.template.volatility > 0.15).slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable style={styles.portfolioCard} onPress={() => {}}>
        <View style={styles.portfolioHeader}>
          <Ionicons name="briefcase" size={18} color="#FFFFFF" />
          <Text style={styles.portfolioTitle}>My stock portfolio</Text>
          <View style={styles.portfolioArrow}>
            <Ionicons name="chevron-forward" size={16} color={palette.primary} />
          </View>
        </View>
        <Text style={styles.portfolioLabel}>Value of stock portfolio</Text>
        <Text style={styles.portfolioValue}>{formatMoney(portfolio.total)}</Text>
        <Text style={[styles.portfolioPnL, portfolio.pl.gte(0) ? styles.pnlPositive : styles.pnlNegative]}>
          {portfolio.pl.gte(0) ? '+' : ''}{formatMoney(portfolio.pl)} ({formatPercent(portfolio.plPct)}) <Text style={{ color: '#BFD3FF', fontWeight: '400' }}>for all time</Text>
        </Text>
        <Text style={styles.portfolioYieldLabel}>Estimated yield per hour</Text>
        <Text style={styles.portfolioYieldValue}>{formatMoney(portfolio.dividendsPerHour)}</Text>
      </Pressable>

      <Pressable style={styles.marketCta} onPress={() => {}}>
        <View>
          <Text style={styles.marketCtaTitle}>Stock market</Text>
          <Text style={styles.marketCtaSubtitle}>View all available offers</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </Pressable>

      <SectionTitle icon="leaf-outline" title="Stable income" subtitle="Shares with the highest dividends" />
      {stable.map((s) => (
        <StockRow key={s.ticker} snap={s} owned={state.stocks[s.ticker]?.quantity ?? 0} />
      ))}

      <SectionTitle icon="flame-outline" title="Growth potential" subtitle="High-volatility tickers with upside" />
      {growth.map((s) => (
        <StockRow key={s.ticker} snap={s} owned={state.stocks[s.ticker]?.quantity ?? 0} />
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function StockRow({ snap, owned }: { snap: StockSnapshot; owned: number }) {
  const buy = useGame((s) => s.buyStock);
  const sell = useGame((s) => s.sellStock);
  const up = snap.changePct >= 0;
  return (
    <View style={styles.stockRow}>
      <View style={styles.stockLeft}>
        <View style={styles.stockTickerCircle}>
          <Text style={styles.stockTickerText}>{snap.ticker.slice(0, 2)}</Text>
        </View>
        <View>
          <Text style={styles.stockTicker}>{snap.ticker}</Text>
          <Text style={styles.stockName}>{snap.template.name}</Text>
        </View>
      </View>
      <View style={styles.stockMid}>
        <Sparkline data={snap.series} width={64} height={24} color={up ? palette.success : palette.danger} showFill={false} />
      </View>
      <View style={styles.stockRight}>
        <Text style={styles.stockPrice}>${snap.price.toFixed(2)}</Text>
        <Text style={[styles.stockChange, { color: up ? palette.success : palette.danger }]}>{up ? '+' : ''}{snap.changePct.toFixed(2)}%</Text>
      </View>
      <View style={styles.stockActions}>
        <Pressable style={styles.buyBtn} onPress={() => buy(snap.ticker, 1, snap.price)}>
          <Text style={styles.buyBtnText}>Buy</Text>
        </Pressable>
        {owned > 0 ? (
          <Pressable style={styles.sellBtn} onPress={() => sell(snap.ticker, 1, snap.price)}>
            <Text style={styles.sellBtnText}>Sell {owned}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function CryptoView() {
  const state = useGame((s) => s.state);
  const snapshots: CryptoSnapshot[] = useMemo(() => getAllCryptos(), []);
  const buy = useGame((s) => s.buyCrypto);
  const sell = useGame((s) => s.sellCrypto);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.cryptoHero}>
        <Ionicons name="logo-bitcoin" size={28} color="#F5B100" />
        <View style={{ flex: 1 }}>
          <Text style={styles.cryptoHeroTitle}>Crypto markets</Text>
          <Text style={styles.cryptoHeroSubtitle}>High volatility · 24/7 trading</Text>
        </View>
      </View>
      {snapshots.map((c) => {
        const owned = state.cryptos[c.symbol]?.quantity ?? 0;
        const up = c.changePct >= 0;
        return (
          <View key={c.symbol} style={styles.stockRow}>
            <View style={styles.stockLeft}>
              <View style={[styles.stockTickerCircle, { backgroundColor: '#F5B100' + '22' }]}>
                <Text style={[styles.stockTickerText, { color: '#F5B100' }]}>{c.symbol.slice(0, 2)}</Text>
              </View>
              <View>
                <Text style={styles.stockTicker}>{c.symbol}</Text>
                <Text style={styles.stockName}>{c.template.name}</Text>
              </View>
            </View>
            <View style={styles.stockMid}>
              <Sparkline data={c.series} width={64} height={24} color={up ? palette.success : palette.danger} showFill={false} />
            </View>
            <View style={styles.stockRight}>
              <Text style={styles.stockPrice}>${c.price < 1 ? c.price.toFixed(4) : c.price.toFixed(2)}</Text>
              <Text style={[styles.stockChange, { color: up ? palette.success : palette.danger }]}>{up ? '+' : ''}{c.changePct.toFixed(2)}%</Text>
            </View>
            <View style={styles.stockActions}>
              <Pressable style={styles.buyBtn} onPress={() => buy(c.symbol, 1, c.price)}>
                <Text style={styles.buyBtnText}>Buy</Text>
              </Pressable>
              {owned > 0 ? (
                <Pressable style={styles.sellBtn} onPress={() => sell(c.symbol, 1, c.price)}>
                  <Text style={styles.sellBtnText}>Sell {owned}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function RealEstateView() {
  return (
    <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 80 }]}>
      <Ionicons name="home-outline" size={48} color={palette.textTertiary} />
      <Text style={styles.emptyTitle}>Real Estate</Text>
      <Text style={styles.emptySubtitle}>Coming next: studios, apartments, penthouses, hotels.</Text>
    </ScrollView>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={18} color={palette.primary} />
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

  portfolioCard: { backgroundColor: palette.primary, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card },
  portfolioHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  portfolioTitle: { ...typography.bodyMedium, color: '#FFFFFF', flex: 1 },
  portfolioArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  portfolioLabel: { ...typography.caption, color: '#BFD3FF', marginTop: spacing.md },
  portfolioValue: { ...typography.display, color: '#FFFFFF' },
  portfolioPnL: { ...typography.caption, marginTop: 2 },
  pnlPositive: { color: '#86EFAC' },
  pnlNegative: { color: '#FCA5A5' },
  portfolioYieldLabel: { ...typography.caption, color: '#BFD3FF', marginTop: spacing.md },
  portfolioYieldValue: { ...typography.headline, color: '#FFFFFF' },

  marketCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: '#3D85FE', borderRadius: radius.xl, ...shadow.card },
  marketCtaTitle: { ...typography.title, color: '#FFFFFF' },
  marketCtaSubtitle: { ...typography.caption, color: '#BFD3FF' },

  sectionTitle: { marginTop: spacing.lg, gap: 2 },
  sectionTitleText: { ...typography.title, color: palette.textPrimary },
  sectionSubtitle: { ...typography.caption, color: palette.textSecondary, marginLeft: 26 },

  stockRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  stockLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1.2 },
  stockTickerCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stockTickerText: { ...typography.caption, fontWeight: '700', color: palette.primary },
  stockTicker: { ...typography.bodyMedium, color: palette.textPrimary },
  stockName: { ...typography.micro, color: palette.textTertiary },
  stockMid: { justifyContent: 'center' },
  stockRight: { alignItems: 'flex-end', minWidth: 72 },
  stockPrice: { ...typography.bodyMedium, color: palette.textPrimary },
  stockChange: { ...typography.caption },
  stockActions: { gap: 4, alignItems: 'flex-end' },
  buyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: palette.primary },
  buyBtnText: { ...typography.micro, color: '#FFFFFF', fontWeight: '700' },
  sellBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: palette.surfaceAlt },
  sellBtnText: { ...typography.micro, color: palette.textPrimary, fontWeight: '600' },

  cryptoHero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  cryptoHeroTitle: { ...typography.title, color: palette.textPrimary },
  cryptoHeroSubtitle: { ...typography.caption, color: palette.textSecondary },

  emptyTitle: { ...typography.title, color: palette.textPrimary, marginTop: spacing.md },
  emptySubtitle: { ...typography.body, color: palette.textSecondary, textAlign: 'center', marginTop: 6 },
});
