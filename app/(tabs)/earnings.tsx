import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { TapZone } from '../../src/components/TapZone';
import { MoneyText } from '../../src/components/MoneyText';
import { palette, radius, spacing, typography, shadow } from '../../src/theme';
import { formatMoney, M } from '../../src/lib/money';
import { tapBaseReward } from '../../src/game/economy';

export default function EarningsScreen() {
  const state = useGame((s) => s.state);
  const doTap = useGame((s) => s.doTap);
  const addBoost = useGame((s) => s.addBoost);
  const bottomPad = useBottomPadding();
  const balance = M(state.balance);
  const perClick = tapBaseReward(state.tapLevel, balance);
  const nextClick = tapBaseReward(state.tapLevel + 1, balance);
  const xpForNext = state.tapLevel * 20;
  const progress = state.tapXp / xpForNext;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <LinearGradient colors={['#0E7C66', '#0F172A']} style={styles.heroBlock} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardMask}>**** 7439</Text>
              <Text style={styles.cardExpiry}>12/30</Text>
            </View>
            <Text style={styles.cardBalanceLabel}>Balance</Text>
            <MoneyText value={balance} style={styles.cardBalance} />
          </View>

          <View style={styles.earningsCard}>
            <View style={styles.earningsTop}>
              <Text style={styles.perClick}>{formatMoney(perClick)} <Text style={styles.perClickLabel}>per click</Text></Text>
              <Text style={styles.levelText}>{state.tapLevel} level</Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={styles.earningsBottom}>
              <Text style={styles.upgradeDelta}>▲ {formatMoney(nextClick.minus(perClick))} <Text style={styles.upgradeDeltaLabel}>per click</Text></Text>
            </View>
          </View>

          <Pressable style={styles.adRow} onPress={() => addBoost({ id: 'tap_2x', multiplier: 2, endsAt: Date.now() + 30_000 })}>
            <View style={styles.adIcon}>
              <Ionicons name="play" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.adLabel}>Ad</Text>
            <View style={styles.adDivider} />
            <View style={styles.adContent}>
              <View style={styles.adAmount}>
                <Ionicons name="logo-usd" size={14} color={palette.success} />
                <Text style={styles.adAmountText}>{formatMoney(perClick.times(2 * 6))}</Text>
              </View>
              <Text style={styles.adSubtitle}>per click for 30 sec.</Text>
            </View>
          </Pressable>
        </LinearGradient>

        <View style={styles.tapArea}>
          <TapZone onTap={doTap} hapticsEnabled={state.settings.haptics} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { flexGrow: 1 },
  heroBlock: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  card: { backgroundColor: '#0B1220', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMask: { color: '#FCD34D', ...typography.caption, letterSpacing: 2 },
  cardExpiry: { color: 'rgba(255,255,255,0.4)', ...typography.caption },
  cardBalanceLabel: { color: '#FCD34D', ...typography.caption, marginTop: spacing.lg },
  cardBalance: { color: '#FFFFFF', ...typography.display },
  earningsCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md },
  earningsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  perClick: { color: '#FFFFFF', ...typography.title },
  perClickLabel: { color: 'rgba(255,255,255,0.5)', ...typography.body },
  levelText: { color: 'rgba(255,255,255,0.6)', ...typography.caption },
  xpTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: spacing.md, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#34D399' },
  earningsBottom: { marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'flex-end' },
  upgradeDelta: { color: '#34D399', ...typography.caption },
  upgradeDeltaLabel: { color: 'rgba(255,255,255,0.5)' },
  adRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(220,252,231,0.95)', borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, ...shadow.card },
  adIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  adLabel: { ...typography.caption, color: palette.textSecondary },
  adDivider: { width: 1, height: 28, backgroundColor: palette.border },
  adContent: { flex: 1 },
  adAmount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  adAmountText: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '700' },
  adSubtitle: { ...typography.caption, color: palette.textSecondary },
  tapArea: { flex: 1, minHeight: 360 },
});
