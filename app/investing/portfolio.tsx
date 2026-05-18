import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Decimal from 'decimal.js';
import { useGame } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { getAllStocks } from '../../src/game/market';
import { formatMoney, formatPercent } from '../../src/lib/money';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { Sparkline } from '../../src/components/Sparkline';

export default function PortfolioScreen() {
  const state = useGame((s) => s.state);
  const bottomPad = useBottomPadding();
  const snapshots = useMemo(() => getAllStocks(), []);

  const holdings = useMemo(() => {
    return Object.values(state.stocks).map((owned) => {
      const snap = snapshots.find((s) => s.ticker === owned.ticker);
      const price = snap?.price ?? 0;
      const value = new Decimal(price).times(owned.quantity);
      const cost = new Decimal(owned.avgCost).times(owned.quantity);
      const pl = value.minus(cost);
      const plPct = cost.gt(0) ? pl.div(cost).times(100) : new Decimal(0);
      const dividendYield = snap?.template.dividendYield ?? 0;
      const dividendsPerHour = value.times(dividendYield).div(365 * 24);
      return { owned, snap, price, value, cost, pl, plPct, dividendsPerHour };
    }).sort((a, b) => b.value.minus(a.value).toNumber());
  }, [state.stocks, snapshots]);

  const totals = useMemo(() => {
    let totalValue = new Decimal(0);
    let totalCost = new Decimal(0);
    let totalDivHr = new Decimal(0);
    for (const h of holdings) {
      totalValue = totalValue.plus(h.value);
      totalCost = totalCost.plus(h.cost);
      totalDivHr = totalDivHr.plus(h.dividendsPerHour);
    }
    const pl = totalValue.minus(totalCost);
    const plPct = totalCost.gt(0) ? pl.div(totalCost).times(100) : new Decimal(0);
    return { totalValue, pl, plPct, totalDivHr };
  }, [holdings]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </Pressable>
          <Text style={styles.heading}>My Shares</Text>
          <Pressable onPress={() => router.push('/investing/stocks' as any)} style={styles.marketBtn}>
            <Text style={styles.marketBtnText}>Market</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Portfolio value</Text>
          <Text style={styles.summaryValue}>{formatMoney(totals.totalValue)}</Text>
          <Text style={[styles.summaryPl, totals.pl.gte(0) ? styles.pnlPos : styles.pnlNeg]}>
            {totals.pl.gte(0) ? '+' : ''}{formatMoney(totals.pl)} · {formatPercent(totals.plPct)} all-time
          </Text>
          <View style={styles.divRow}>
            <Ionicons name="trending-up-outline" size={14} color={palette.textSecondary} />
            <Text style={styles.divLabel}>Dividend yield</Text>
            <Text style={styles.divValue}>{formatMoney(totals.totalDivHr)}/hr</Text>
          </View>
        </View>

        {holdings.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color={palette.textTertiary} />
            <Text style={styles.emptyTitle}>No stocks yet</Text>
            <Text style={styles.emptySub}>Head to the stock market to make your first investment.</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push('/investing/stocks' as any)}>
              <Text style={styles.emptyBtnText}>Browse stocks</Text>
            </Pressable>
          </View>
        ) : (
          holdings.map(({ owned, snap, price, value, pl, plPct, dividendsPerHour }) => (
            <Pressable key={owned.ticker} style={styles.holdingRow} onPress={() => router.push(`/investing/stock/${owned.ticker}` as any)}>
              <View style={[styles.tickerCircle, { backgroundColor: (snap?.template.color ?? '#2563EB') + '22' }]}>
                <Text style={[styles.tickerText, { color: snap?.template.color ?? '#2563EB' }]}>{owned.ticker.slice(0, 2)}</Text>
              </View>
              <View style={styles.holdingBody}>
                <Text style={styles.holdingTicker}>{owned.ticker}</Text>
                <Text style={styles.holdingName}>{snap?.template.name ?? ''}</Text>
                <Text style={styles.holdingQty}>{owned.quantity} pcs · {formatMoney(price)}/share</Text>
              </View>
              {snap ? (
                <Sparkline data={snap.series} width={48} height={20} color={pl.gte(0) ? palette.success : palette.danger} showFill={false} />
              ) : null}
              <View style={styles.holdingRight}>
                <Text style={styles.holdingValue}>{formatMoney(value)}</Text>
                <Text style={[styles.holdingPl, pl.gte(0) ? styles.pnlPos : styles.pnlNeg]}>
                  {pl.gte(0) ? '+' : ''}{formatPercent(plPct)}
                </Text>
                <Text style={styles.holdingDiv}>{formatMoney(dividendsPerHour)}/hr</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  heading: { ...typography.hero, color: palette.textPrimary, flex: 1 },
  marketBtn: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: palette.primarySoft },
  marketBtnText: { ...typography.caption, color: palette.primary, fontWeight: '700' },
  summaryCard: { backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card },
  summaryLabel: { ...typography.caption, color: palette.textSecondary },
  summaryValue: { ...typography.display, color: palette.textPrimary, marginTop: 2 },
  summaryPl: { ...typography.caption, marginTop: 2 },
  pnlPos: { color: palette.success },
  pnlNeg: { color: palette.danger },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  divLabel: { ...typography.caption, color: palette.textSecondary, flex: 1 },
  divValue: { ...typography.bodyMedium, color: palette.textPrimary },
  holdingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  tickerCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tickerText: { ...typography.caption, fontWeight: '800' },
  holdingBody: { flex: 1 },
  holdingTicker: { ...typography.bodyMedium, color: palette.textPrimary },
  holdingName: { ...typography.micro, color: palette.textTertiary },
  holdingQty: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  holdingRight: { alignItems: 'flex-end' },
  holdingValue: { ...typography.bodyMedium, color: palette.textPrimary },
  holdingPl: { ...typography.caption, marginTop: 2 },
  holdingDiv: { ...typography.micro, color: palette.success, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 48, gap: spacing.md },
  emptyTitle: { ...typography.title, color: palette.textPrimary },
  emptySub: { ...typography.body, color: palette.textSecondary, textAlign: 'center' },
  emptyBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: palette.primary, borderRadius: radius.pill },
  emptyBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
});
