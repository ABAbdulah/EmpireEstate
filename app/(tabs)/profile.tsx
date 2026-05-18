import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Decimal from 'decimal.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame, computeNetworth, aggregateBySource } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { NetworthCard } from '../../src/components/NetworthCard';
import { AssetCard } from '../../src/components/AssetCard';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { palette, radius, spacing, typography, shadow } from '../../src/theme';
import { formatMoney, formatInteger, M } from '../../src/lib/money';
import { computePlayerLevel } from '../../src/game/economy';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const state = useGame((s) => s.state);
  const payTaxes = useGame((s) => s.payTaxes);
  const resetGame = useGame((s) => s.reset);
  const bottomPad = useBottomPadding();

  const networth = useMemo(() => computeNetworth(state), [state]);
  const by = useMemo(() => aggregateBySource(state), [state]);
  const level = useMemo(() => computePlayerLevel(networth), [networth]);

  const taxDue = new Decimal(state.taxAccrued);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>Profile</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Pressable style={styles.connectBtn}>
              <Ionicons name="person-circle-outline" size={20} color={palette.textSecondary} />
              <Text style={styles.connectText}>Connect</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/settings' as any)}>
              <Ionicons name="settings-outline" size={20} color={palette.textSecondary} />
            </Pressable>
          </View>
        </View>

        <NetworthCard
          networth={networth}
          delta={M(state.totalEarned).minus(state.totalSpent)}
          deltaLabel="all-time"
          levelTitle={level.title}
        />

        <View style={styles.progressLine}>
          <Text style={styles.progressLabel}>Level {level.level} · {level.title}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${level.progress * 100}%` }]} />
          </View>
          {level.nextThreshold ? (
            <Text style={styles.progressNext}>Next: {formatMoney(level.nextThreshold)}</Text>
          ) : <Text style={styles.progressNext}>Max level reached</Text>}
        </View>

        <View style={styles.grid}>
          <View style={styles.row}>
            <AssetCard category="balance"    label="Balance"     value={by.balance} cta="Tap to earn" onPress={() => router.push('/earnings')} />
            <AssetCard category="businesses" label="Businesses"  value={by.businesses} cta="Open a business" onPress={() => router.push('/business')} />
          </View>
          <View style={styles.row}>
            <AssetCard category="stocks"     label="Stocks"      value={by.stocks} cta="Buy stocks" onPress={() => router.push('/investing')} />
            <AssetCard category="realEstate" label="Real Estate" value={by.realEstate} cta="Buy property" onPress={() => router.push('/investing')} />
          </View>
          <View style={styles.row}>
            <AssetCard category="transport"  label="Transport"   value={by.transport} cta="Browse items" onPress={() => router.push('/items')} />
            <AssetCard category="collections"label="Collections" value={by.collections} cta="View sets" onPress={() => router.push('/items')} />
          </View>
          <View style={styles.row}>
            <AssetCard category="crypto"     label="Cryptoassets" value={by.crypto} cta="Buy crypto" onPress={() => router.push('/investing')} />
            <AssetCard category="residence"  label="Residence"   value={by.residence} cta="Buy a home" onPress={() => router.push('/items')} />
          </View>
        </View>

        <Pressable style={styles.prestigeCard} onPress={() => router.push('/prestige' as any)}>
          <View style={styles.prestigeLeft}>
            <Text style={styles.prestigeStars}>
              {state.prestigeStars > 0 ? '★'.repeat(Math.min(state.prestigeStars, 8)) : '☆'}
            </Text>
            <View>
              <Text style={styles.prestigeTitle}>Prestige</Text>
              <Text style={styles.prestigeSubtitle}>
                {state.prestigeStars > 0 ? `+${state.prestigeStars * 2}% all income` : 'Reset for permanent bonuses'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>

        <Card style={styles.taxCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={styles.taxIcon}>
              <Ionicons name="business" size={26} color={palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taxTitle}>Taxes</Text>
              <Text style={styles.taxSubtitle}>
                {taxDue.gt(0) ? `${formatMoney(taxDue)} pending` : 'No taxes due'}
              </Text>
            </View>
            <Button
              label="Pay"
              size="sm"
              variant={taxDue.gt(0) ? 'primary' : 'ghost'}
              disabled={taxDue.lte(0)}
              onPress={() => {
                const ok = payTaxes();
                if (!ok) Alert.alert("Can't pay", "Insufficient balance to pay taxes.");
              }}
            />
          </View>
        </Card>

        <View style={styles.statsRow}>
          <Stat label="Total earned" value={formatMoney(state.totalEarned)} />
          <Stat label="Total spent" value={formatMoney(state.totalSpent)} />
          <Stat label="Taps" value={formatInteger(state.totalTaps)} />
          <Stat label="Prestige" value={state.prestigeCount.toString()} />
        </View>

        <Pressable
          onPress={() => Alert.alert('Reset?', 'This will erase all progress. For testing only.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: () => resetGame() },
          ])}
          style={styles.resetBtn}
        >
          <Text style={styles.resetText}>Reset progress (dev)</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { ...typography.hero, color: palette.textPrimary },
  connectBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: palette.surfaceAlt, borderRadius: radius.pill },
  connectText: { ...typography.caption, color: palette.textSecondary },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceAlt, borderRadius: 18 },
  prestigeCard: { backgroundColor: '#1F2937', borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prestigeLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  prestigeStars: { fontSize: 24, color: '#F59E0B' },
  prestigeTitle: { ...typography.title, color: '#FFFFFF' },
  prestigeSubtitle: { ...typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  progressLine: { gap: 6 },
  progressLabel: { ...typography.caption, color: palette.textSecondary },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: palette.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: palette.primary, borderRadius: 3 },
  progressNext: { ...typography.micro, color: palette.textTertiary },
  grid: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  taxCard: {},
  taxIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  taxTitle: { ...typography.title, color: palette.textPrimary },
  taxSubtitle: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statBox: { flex: 1, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.md, ...shadow.card },
  statLabel: { ...typography.micro, color: palette.textTertiary, textTransform: 'uppercase' },
  statValue: { ...typography.bodyMedium, color: palette.textPrimary, marginTop: 2 },
  resetBtn: { alignSelf: 'center', padding: spacing.sm },
  resetText: { ...typography.caption, color: palette.textTertiary },
});
