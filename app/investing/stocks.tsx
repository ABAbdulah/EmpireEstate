import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame, computeNetworth } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { getAllStocks } from '../../src/game/market';
import { formatMoney, M } from '../../src/lib/money';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { Sparkline } from '../../src/components/Sparkline';

type Filter = 'All' | 'Hot' | 'Gainers' | 'Losers' | 'Dividend';

export default function StocksMarketScreen() {
  const state = useGame((s) => s.state);
  const bottomPad = useBottomPadding();
  const networth = useMemo(() => computeNetworth(state), [state]);
  const allSnaps = useMemo(() => getAllStocks(), []);
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const visible = allSnaps.filter((s) => M(networth).gte(s.template.unlockNetworth));
  const locked = allSnaps.filter((s) => M(networth).lt(s.template.unlockNetworth));

  const filtered = useMemo(() => {
    let list = visible;
    if (search) list = list.filter((s) => s.template.name.toLowerCase().includes(search.toLowerCase()) || s.ticker.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'Hot')      list = [...list].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
    if (filter === 'Gainers')  list = list.filter((s) => s.changePct > 0).sort((a, b) => b.changePct - a.changePct);
    if (filter === 'Losers')   list = list.filter((s) => s.changePct < 0).sort((a, b) => a.changePct - b.changePct);
    if (filter === 'Dividend') list = [...list].sort((a, b) => b.template.dividendYield - a.template.dividendYield);
    return list;
  }, [visible, filter, search]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.heading}>Stock Market</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={palette.textTertiary} />
        <TextInput
          value={search} onChangeText={setSearch}
          placeholder="Search stocks..." placeholderTextColor={palette.textTertiary}
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {(['All', 'Hot', 'Gainers', 'Losers', 'Dividend'] as Filter[]).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterPill, filter === f && styles.filterPillActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        {filtered.map((snap) => {
          const ownedQty = state.stocks[snap.ticker]?.quantity ?? 0;
          const up = snap.changePct >= 0;
          return (
            <Pressable key={snap.ticker} style={styles.row} onPress={() => router.push(`/investing/stock/${snap.ticker}` as any)}>
              <View style={[styles.circle, { backgroundColor: snap.template.color + '22' }]}>
                <Text style={[styles.circleText, { color: snap.template.color }]}>{snap.ticker.slice(0, 2)}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.ticker}>{snap.ticker}</Text>
                <Text style={styles.name}>{snap.template.name}</Text>
                {ownedQty > 0 ? <Text style={styles.owned}>{ownedQty} pcs owned</Text> : null}
              </View>
              <Sparkline data={snap.series} width={56} height={22} color={up ? palette.success : palette.danger} showFill={false} />
              <View style={styles.right}>
                <Text style={styles.price}>{formatMoney(snap.price)}</Text>
                <Text style={[styles.change, { color: up ? palette.success : palette.danger }]}>
                  {up ? '▲' : '▼'} {Math.abs(snap.changePct).toFixed(2)}%
                </Text>
              </View>
            </Pressable>
          );
        })}

        {locked.length > 0 ? (
          <View style={styles.lockedSection}>
            <View style={styles.lockedHeader}>
              <Ionicons name="lock-closed-outline" size={14} color={palette.textTertiary} />
              <Text style={styles.lockedHeaderText}>{locked.length} stocks locked</Text>
            </View>
            {locked.map((snap) => (
              <View key={snap.ticker} style={[styles.row, { opacity: 0.4 }]}>
                <View style={[styles.circle, { backgroundColor: snap.template.color + '22' }]}>
                  <Ionicons name="lock-closed" size={14} color={snap.template.color} />
                </View>
                <View style={styles.body}>
                  <Text style={styles.ticker}>{snap.ticker}</Text>
                  <Text style={styles.name}>{snap.template.name}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.price}>{formatMoney(snap.template.unlockNetworth)} NW</Text>
                  <Text style={styles.lockedReq}>required</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  heading: { ...typography.hero, color: palette.textPrimary },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 10, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  searchInput: { flex: 1, ...typography.body, color: palette.textPrimary },
  filterScroll: { flexGrow: 0 },
  filterRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: palette.surfaceAlt },
  filterPillActive: { backgroundColor: palette.primary },
  filterText: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  content: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  circle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  circleText: { ...typography.caption, fontWeight: '800' },
  body: { flex: 1 },
  ticker: { ...typography.bodyMedium, color: palette.textPrimary },
  name: { ...typography.micro, color: palette.textTertiary },
  owned: { ...typography.micro, color: palette.primary, fontWeight: '700', marginTop: 2 },
  right: { alignItems: 'flex-end', minWidth: 80 },
  price: { ...typography.bodyMedium, color: palette.textPrimary },
  change: { ...typography.caption },
  lockedSection: { marginTop: spacing.md, gap: spacing.sm },
  lockedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm },
  lockedHeaderText: { ...typography.caption, color: palette.textTertiary },
  lockedReq: { ...typography.micro, color: palette.textTertiary },
});
