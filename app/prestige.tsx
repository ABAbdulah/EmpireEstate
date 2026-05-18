import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Decimal from 'decimal.js';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame, computeNetworth } from '../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../src/theme';
import { formatMoney, M } from '../src/lib/money';

export default function PrestigeScreen() {
  const state = useGame((s) => s.state);
  const prestigeAction = useGame((s) => s.prestige);

  const networth = useMemo(() => computeNetworth(state), [state]);
  const threshold = useMemo(
    () => M('1000000').times(new Decimal('5').pow(state.prestigeCount)),
    [state.prestigeCount]
  );
  const canPrestige = networth.gte(threshold);
  const bonusPct = (state.prestigeStars + 1) * 2;
  const currentBonusPct = state.prestigeStars * 2;
  const progress = Math.min(1, networth.div(threshold).toNumber());

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.heading}>Prestige</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.starsCard}>
          <Text style={styles.starsLabel}>Prestige Stars</Text>
          <Text style={styles.starsValue}>{'★'.repeat(Math.min(state.prestigeStars, 10)) || '☆'}</Text>
          <Text style={styles.starsCount}>{state.prestigeStars} stars · Prestige #{state.prestigeCount}</Text>
          {state.prestigeStars > 0 && (
            <View style={styles.activeBonusPill}>
              <Text style={styles.activeBonusText}>+{currentBonusPct}% all income active</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Next prestige reward</Text>
          <View style={styles.rewardRow}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.rewardText}>+1 prestige star (+{bonusPct - currentBonusPct}% all income permanently)</Text>
          </View>
          <Text style={[styles.infoTitle, { marginTop: spacing.md }]}>Requirement</Text>
          <Text style={styles.requireText}>Net worth ≥ {formatMoney(threshold)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{formatMoney(networth)} / {formatMoney(threshold)}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What resets</Text>
          {['Balance', 'Businesses & upgrades', 'Stocks & crypto', 'Properties', 'Car showrooms'].map((item) => (
            <View key={item} style={styles.listRow}>
              <Ionicons name="close-circle" size={16} color={palette.danger} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}

          <Text style={[styles.infoTitle, { marginTop: spacing.md }]}>What you keep</Text>
          {['All items (garage, hangar, harbor)', 'Collection bonuses', 'Prestige stars & multiplier', 'Settings & VIP status'].map((item) => (
            <View key={item} style={styles.listRow}>
              <Ionicons name="checkmark-circle" size={16} color={palette.success} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => {
            if (!canPrestige) {
              Alert.alert('Not yet', `You need ${formatMoney(threshold)} net worth to prestige. Currently at ${formatMoney(networth)}.`);
              return;
            }
            Alert.alert(
              'Prestige?',
              `You will reset your empire and gain 1 prestige star (+2% all income). This cannot be undone.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Prestige!',
                  style: 'destructive',
                  onPress: () => {
                    prestigeAction();
                    router.back();
                  },
                },
              ]
            );
          }}
          style={[styles.prestigeBtn, !canPrestige && styles.prestigeBtnDisabled]}
        >
          <Text style={[styles.prestigeBtnText, !canPrestige && styles.prestigeBtnTextDisabled]}>
            {canPrestige ? '★ PRESTIGE NOW' : `Need ${formatMoney(threshold)}`}
          </Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heading: { ...typography.hero, color: palette.textPrimary },
  content: { padding: spacing.lg, gap: spacing.lg },
  starsCard: { backgroundColor: '#1F2937', borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, ...shadow.card },
  starsLabel: { ...typography.caption, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 },
  starsValue: { fontSize: 40, color: '#F59E0B' },
  starsCount: { ...typography.bodyMedium, color: 'rgba(255,255,255,0.8)' },
  activeBonusPill: { backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, marginTop: spacing.xs },
  activeBonusText: { ...typography.caption, color: '#F59E0B', fontWeight: '600' },
  infoCard: { backgroundColor: palette.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, ...shadow.card },
  infoTitle: { ...typography.title, color: palette.textPrimary, marginBottom: 4 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rewardText: { ...typography.bodyMedium, color: palette.textPrimary, flex: 1 },
  requireText: { ...typography.bodyMedium, color: palette.textSecondary },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: palette.surfaceAlt, overflow: 'hidden', marginTop: spacing.sm },
  progressFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 4 },
  progressLabel: { ...typography.caption, color: palette.textSecondary },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  listText: { ...typography.bodyMedium, color: palette.textSecondary },
  prestigeBtn: { backgroundColor: '#F59E0B', borderRadius: radius.pill, padding: spacing.lg, alignItems: 'center' },
  prestigeBtnDisabled: { backgroundColor: palette.surfaceAlt },
  prestigeBtnText: { ...typography.headline, color: '#FFFFFF', fontWeight: '700' },
  prestigeBtnTextDisabled: { color: palette.textTertiary },
});
