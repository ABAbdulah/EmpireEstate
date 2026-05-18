import React, { useMemo, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Decimal from 'decimal.js';
import { useGame, aggregateIncomePerHour, computeNetworth } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { BUSINESSES, BusinessTemplate } from '../../src/content/businesses';
import { SPECIALIZATIONS } from '../../src/content/carBusiness';
import { BusinessRow } from '../../src/components/BusinessRow';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { formatMoney, M, ZERO } from '../../src/lib/money';
import { pendingReward } from '../../src/game/economy';
import { Button } from '../../src/components/Button';
import { StartBusinessSheet } from '../../src/components/StartBusinessSheet';
import { NameBusinessSheet } from '../../src/components/NameBusinessSheet';
import { router } from 'expo-router';
import { useRewardedAd } from '../../src/hooks/useRewardedAd';
import { useInterstitialAd } from '../../src/hooks/useInterstitialAd';

export default function BusinessScreen() {
  const state = useGame((s) => s.state);
  const buy = useGame((s) => s.buyBusiness);
  const collect = useGame((s) => s.collectBusiness);
  const collectAll = useGame((s) => s.collectAllBusinesses);
  const hire = useGame((s) => s.hireManager);
  const addBoost = useGame((s) => s.addBoost);
  const bottomPad = useBottomPadding();

  const onRewarded = useCallback(() => {
    addBoost({ id: 'business_30', multiplier: 1.3, endsAt: Date.now() + 4 * 3600_000 });
    Alert.alert('Boost active!', '+30% income for 4 hours.');
  }, [addBoost]);

  const { adState, show: showRewardedAd } = useRewardedAd(onRewarded);
  const { onAction: onInterstitialAction } = useInterstitialAd();

  const [startOpen, setStartOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState<BusinessTemplate | null>(null);
  // Bumps every 1s so the pending total stays live without a full store re-render.
  const [, setNow] = useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const networth = useMemo(() => computeNetworth(state), [state]);
  const incomePerHour = useMemo(() => aggregateIncomePerHour(state), [state]);

  const owned = BUSINESSES.filter((b) => (state.businesses[b.id]?.level ?? 0) > 0);
  const available = BUSINESSES.filter((b) => (state.businesses[b.id]?.level ?? 0) === 0 && networth.gte(b.unlockNetworth));
  const locked = BUSINESSES.filter((b) => networth.lt(b.unlockNetworth));

  const totalPending = useMemo(() => {
    const now = Date.now();
    let t: Decimal = ZERO;
    for (const tmpl of owned) {
      const o = state.businesses[tmpl.id];
      if (!o || o.hasManager) continue;
      t = t.plus(pendingReward(tmpl, o.level, o.lastCollectedAt, now));
    }
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.businesses, Math.floor(Date.now() / 1000)]);

  const ownedCount = owned.length + state.carBusinesses.length;
  const slotMax = 10;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
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
          {totalPending.gt(0.01) ? (
            <Pressable style={styles.pendingRow} onPress={() => { collectAll(Date.now()); onInterstitialAction(); }}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingLabel}>Pending collection</Text>
              <Text style={styles.pendingValue}>{formatMoney(totalPending)}</Text>
              <View style={styles.collectAllBtn}>
                <Text style={styles.collectAllText}>Collect all</Text>
              </View>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.raisePill, adState !== 'ready' && { opacity: 0.5 }]}
            onPress={adState === 'ready' ? showRewardedAd : undefined}
          >
            <Ionicons name="play" size={12} color={palette.primary} />
            <Text style={styles.raiseLabel}>{adState === 'loading' ? 'Loading…' : (adState === 'error' || adState === 'unavailable') ? 'Ad' : 'Ad'}</Text>
            <View style={{ width: 1, height: 14, backgroundColor: palette.border, marginHorizontal: 8 }} />
            <Text style={styles.raiseText}>Raise income (+30% for 4h)</Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <Button label="Start a business" onPress={() => setStartOpen(true)} style={{ flex: 1 }} />
          <Button label="Business mergers" variant="secondary" onPress={() => router.push('/mergers' as any)} style={{ flex: 1 }} />
        </View>

        {state.carBusinesses.length > 0 ? (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Car businesses</Text>
            {state.carBusinesses.map((cb) => {
              const spec = SPECIALIZATIONS.find((s) => s.id === cb.specialization);
              const hourly = M(spec?.baseHourlyPerVehicle ?? '0').times(cb.inventory.length);
              return (
                <Pressable
                  key={cb.uid}
                  style={styles.carRow}
                  onPress={() => router.push(`/car-business/${cb.uid}` as any)}
                >
                  <View style={styles.carIconWrap}>
                    <Text style={styles.carEmoji}>{cb.specialization === 'premium' ? '🏎️' : cb.specialization === 'luxury' ? '🚗' : '🚙'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.carName}>{cb.name}</Text>
                    <Text style={styles.carMeta}>{cb.showroomType === 'used' ? 'Used' : 'New'} · {cb.showroomCapacity} places · {spec?.label}</Text>
                    <Text style={styles.carInventory}>{cb.inventory.length}/{cb.showroomCapacity} vehicles · {formatMoney(hourly)}/hr</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {owned.length > 0 ? (
          <View style={{ gap: spacing.md }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My companies</Text>
              <Text style={styles.sectionMeta}>{ownedCount}/{slotMax}</Text>
            </View>
            {owned.map((t) => (
              <BusinessRow
                key={t.id}
                template={t}
                owned={state.businesses[t.id]}
                balance={state.balance}
                onPress={() => router.push({ pathname: '/business/[id]', params: { id: t.id } })}
                onCollect={() => collect(t.id, Date.now())}
                onHire={() => {
                  const ok = hire(t.id);
                  if (!ok) Alert.alert("Can't hire", `Need ${formatMoney(t.managerCost)} to hire a manager for ${t.name}.`);
                }}
              />
            ))}
          </View>
        ) : null}

        {available.length > 0 ? (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.sectionTitle}>Available to start</Text>
            {available.map((t) => (
              <BusinessRow
                key={t.id}
                template={t}
                balance={state.balance}
                onPress={() => {
                  if (M(state.balance).lt(t.baseCost)) {
                    Alert.alert("Can't buy", `Need ${formatMoney(t.baseCost)} to open ${t.name}.`);
                    return;
                  }
                  setNameOpen(t);
                }}
              />
            ))}
          </View>
        ) : null}

        {locked.length > 0 ? (
          <View style={styles.lockedHint}>
            <Ionicons name="lock-closed-outline" size={16} color={palette.textTertiary} />
            <Text style={styles.lockedText}>
              {locked.length} more business{locked.length === 1 ? '' : 'es'} unlock as your fortune grows
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <StartBusinessSheet
        visible={startOpen}
        onClose={() => setStartOpen(false)}
        onStartQuick={(t) => setNameOpen(t)}
      />
      <NameBusinessSheet
        visible={!!nameOpen}
        template={nameOpen}
        mode="buy"
        onCancel={() => setNameOpen(null)}
        onConfirm={(name) => {
          if (!nameOpen) return;
          const ok = buy(nameOpen.id, name);
          if (!ok) Alert.alert("Can't buy", `Need ${formatMoney(nameOpen.baseCost)} to open ${nameOpen.name}.`);
          setNameOpen(null);
        }}
      />
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
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.md, padding: spacing.md, backgroundColor: palette.successSoft, borderRadius: radius.md },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.success },
  pendingLabel: { ...typography.caption, color: palette.textSecondary, flex: 1 },
  pendingValue: { ...typography.bodyMedium, color: palette.success, fontWeight: '700' },
  collectAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: palette.success },
  collectAllText: { ...typography.micro, color: '#FFFFFF', fontWeight: '700' },
  raisePill: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: palette.surfaceAlt, borderRadius: radius.pill, alignSelf: 'flex-start' },
  raiseLabel: { ...typography.caption, color: palette.textSecondary, marginLeft: 4 },
  raiseText: { ...typography.caption, color: palette.primary, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { ...typography.title, color: palette.textPrimary },
  sectionMeta: { ...typography.caption, color: palette.textSecondary },
  carRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  carIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  carEmoji: { fontSize: 22 },
  carName: { ...typography.title, color: palette.textPrimary },
  carMeta: { ...typography.micro, color: palette.textTertiary, marginTop: 2 },
  carInventory: { ...typography.caption, color: palette.success, marginTop: 4 },
  lockedHint: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.md, backgroundColor: palette.surfaceAlt, borderRadius: radius.md, justifyContent: 'center' },
  lockedText: { ...typography.caption, color: palette.textTertiary },
});
