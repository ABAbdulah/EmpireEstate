import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame, aggregateIncomePerHour, computeNetworth } from '../../src/store/gameStore';
import { BUSINESSES } from '../../src/content/businesses';
import { BusinessRow } from '../../src/components/BusinessRow';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { formatMoney, M } from '../../src/lib/money';
import { Button } from '../../src/components/Button';
import { router } from 'expo-router';

export default function BusinessScreen() {
  const state = useGame((s) => s.state);
  const buy = useGame((s) => s.buyBusiness);
  const collect = useGame((s) => s.collectBusiness);

  const networth = useMemo(() => computeNetworth(state), [state]);
  const incomePerHour = useMemo(() => aggregateIncomePerHour(state), [state]);

  const visible = BUSINESSES.filter((b) => networth.gte(b.unlockNetworth));
  const ownedCount = Object.values(state.businesses).filter((b) => b.level > 0).length;
  const slotMax = 10;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.heading}>Business</Text>
          <Pressable style={styles.slotsPill}>
            <Ionicons name="grid-outline" size={16} color={palette.primary} />
            <Text style={styles.slotsText}>Business slots</Text>
          </Pressable>
        </View>

        <View style={styles.incomeCard}>
          <Text style={styles.incomeValue}>{formatMoney(incomePerHour)}</Text>
          <Text style={styles.incomeLabel}>Total income per hour</Text>
          <Pressable style={styles.raisePill} onPress={() => useGame.getState().addBoost({ id: 'business_30', multiplier: 1.3, endsAt: Date.now() + 4 * 3600_000 })}>
            <Ionicons name="play" size={12} color={palette.primary} />
            <Text style={styles.raiseLabel}>Ad</Text>
            <View style={{ width: 1, height: 14, backgroundColor: palette.border, marginHorizontal: 8 }} />
            <Text style={styles.raiseText}>Raise income (+30% for 4h)</Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <Button label="Start a business" onPress={() => Alert.alert('Tip', 'Tap any locked card below to start that business.')} style={{ flex: 1 }} />
          <Button label="Business mergers" variant="secondary" onPress={() => Alert.alert('Coming soon', 'Mergers unlock after 5 owned businesses.')} style={{ flex: 1 }} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My companies</Text>
          <Text style={styles.sectionMeta}>{ownedCount}/{slotMax}</Text>
        </View>

        <View style={{ gap: spacing.md }}>
          {visible.map((t) => (
            <BusinessRow
              key={t.id}
              template={t}
              owned={state.businesses[t.id]}
              onPress={() => {
                const has = state.businesses[t.id]?.level > 0;
                if (has) {
                  router.push({ pathname: '/business/[id]', params: { id: t.id } });
                } else {
                  const ok = buy(t.id);
                  if (!ok) Alert.alert("Can't buy", `Need ${formatMoney(t.baseCost)} to open ${t.name}.`);
                }
              }}
              onCollect={() => collect(t.id, Date.now())}
            />
          ))}
        </View>

        {BUSINESSES.length > visible.length ? (
          <View style={styles.lockedHint}>
            <Ionicons name="lock-closed-outline" size={16} color={palette.textTertiary} />
            <Text style={styles.lockedText}>
              {BUSINESSES.length - visible.length} more business{BUSINESSES.length - visible.length === 1 ? '' : 'es'} unlock as your fortune grows
            </Text>
          </View>
        ) : null}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { ...typography.hero, color: palette.textPrimary },
  slotsPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: palette.primarySoft, borderRadius: radius.pill },
  slotsText: { ...typography.caption, color: palette.primary, fontWeight: '600' },
  incomeCard: { padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  incomeValue: { ...typography.hero, color: palette.textPrimary },
  incomeLabel: { ...typography.caption, color: palette.success, marginTop: 2 },
  raisePill: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: palette.surfaceAlt, borderRadius: radius.pill, alignSelf: 'flex-start' },
  raiseLabel: { ...typography.caption, color: palette.textSecondary, marginLeft: 4 },
  raiseText: { ...typography.caption, color: palette.primary, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { ...typography.title, color: palette.textPrimary },
  sectionMeta: { ...typography.caption, color: palette.textSecondary },
  lockedHint: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.md, backgroundColor: palette.surfaceAlt, borderRadius: radius.md, justifyContent: 'center' },
  lockedText: { ...typography.caption, color: palette.textTertiary },
});
