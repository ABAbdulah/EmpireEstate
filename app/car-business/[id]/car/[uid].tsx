import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame, carFixCost, carMarketPrice } from '../../../../src/store/gameStore';
import { CAR_CATALOG } from '../../../../src/content/carBusiness';
import { getCarImage } from '../../../../src/content/carImages';
import { palette, radius, shadow, spacing, typography } from '../../../../src/theme';
import { formatMoney, M } from '../../../../src/lib/money';

const PARTS: Array<{ id: 'engine' | 'transmission' | 'chassis' | 'body'; label: string; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }> = [
  { id: 'engine',       label: 'Engine',       icon: 'flash-outline' },
  { id: 'transmission', label: 'Transmission', icon: 'cog-outline' },
  { id: 'chassis',      label: 'Chassis',      icon: 'car-sport-outline' },
  { id: 'body',         label: 'Body',         icon: 'shield-outline' },
];

export default function CarDetail() {
  const { id, uid } = useLocalSearchParams<{ id: string; uid: string }>();
  const cb = useGame((s) => s.state.carBusinesses.find((b) => b.uid === id));
  const balance = useGame((s) => s.state.balance);
  const fix = useGame((s) => s.fixCarPart);
  const listForSale = useGame((s) => s.listCarForSale);
  const cancelListing = useGame((s) => s.cancelCarListing);

  // Tick every second to keep countdown live
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const car = cb?.inventory.find((c) => c.uid === uid);
  const tmpl = useMemo(() => car ? CAR_CATALOG.find((c) => c.id === car.catalogId) : null, [car]);

  if (!cb || !car || !tmpl) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
          <Text style={{ color: palette.textSecondary }}>Car not found.</Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: spacing.md }}>
            <Text style={{ color: palette.primary }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const marketPrice = carMarketPrice(car, tmpl.basePrice, tmpl.segment);
  const totalCost = M(car.purchasePrice).plus(car.fixesSpent);
  const profit = marketPrice.minus(totalCost);
  const profitPct = totalCost.gt(0) ? profit.div(totalCost).times(100).toNumber() : 0;
  const isProfit = profit.gte(0);
  const localImg = getCarImage(tmpl.id);
  const isPerfectCondition = car.condition >= 0.999;

  // For-sale countdown
  let timeRemaining = '';
  let progressPct = 0;
  if (car.forSale && car.forSaleListedAt && car.forSaleCompletesAt) {
    const total = car.forSaleCompletesAt - car.forSaleListedAt;
    const elapsed = Date.now() - car.forSaleListedAt;
    progressPct = Math.min(100, (elapsed / total) * 100);
    const remainingMs = Math.max(0, car.forSaleCompletesAt - Date.now());
    const mins = Math.floor(remainingMs / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);
    timeRemaining = `${mins}m ${secs}s`;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{tmpl.name}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Hero image */}
        <View style={styles.heroImg}>
          {localImg ? (
            <Image source={localImg} style={styles.heroImageInner} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 96 }}>{tmpl.emoji}</Text>
          )}
        </View>

        {/* Sale countdown */}
        {car.forSale ? (
          <View style={styles.saleBanner}>
            <Ionicons name="time-outline" size={18} color="#92400E" />
            <View style={{ flex: 1 }}>
              <Text style={styles.saleBannerTitle}>Listed for sale</Text>
              <Text style={styles.saleBannerSub}>Auto-sells in {timeRemaining}</Text>
              <View style={styles.saleBarTrack}>
                <View style={[styles.saleBarFill, { width: `${progressPct}%` }]} />
              </View>
            </View>
          </View>
        ) : null}

        {/* Specs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specs</Text>
          <SpecRow label="Segment" value={tmpl.segment.toUpperCase()} />
          <SpecRow label="Vehicle type" value={tmpl.vehicleType} />
          <SpecRow label="Purchase price" value={formatMoney(car.purchasePrice)} />
          <SpecRow label="Fixes invested" value={formatMoney(car.fixesSpent)} />
          <SpecRow label="Total cost" value={formatMoney(totalCost.toString())} />
          <View style={styles.conditionRow}>
            <Text style={styles.specLabel}>Condition</Text>
            <View style={styles.conditionTrack}>
              <View style={[
                styles.conditionFill,
                {
                  width: `${Math.round(car.condition * 100)}%`,
                  backgroundColor: car.condition >= 0.75 ? palette.success : car.condition >= 0.5 ? '#F59E0B' : palette.danger,
                },
              ]} />
            </View>
            <Text style={styles.conditionPct}>{Math.round(car.condition * 100)}%</Text>
          </View>
        </View>

        {/* Market price */}
        <View style={[styles.section, styles.marketCard]}>
          <Text style={styles.marketLabel}>Estimated market price</Text>
          <Text style={styles.marketPrice}>{formatMoney(marketPrice)}</Text>
          <View style={[styles.profitPill, { backgroundColor: isProfit ? '#DCFCE7' : '#FEE2E2' }]}>
            <Ionicons name={isProfit ? 'trending-up' : 'trending-down'} size={14} color={isProfit ? palette.success : palette.danger} />
            <Text style={[styles.profitText, { color: isProfit ? palette.success : palette.danger }]}>
              {isProfit ? '+' : ''}{formatMoney(profit.toString())} ({profitPct.toFixed(0)}%)
            </Text>
          </View>
        </View>

        {/* Fix actions */}
        {!car.forSale && !isPerfectCondition ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Improve condition</Text>
            <Text style={styles.sectionDesc}>Each fix increases condition by 15% and boosts market price.</Text>
            <View style={styles.partsGrid}>
              {PARTS.map((part) => {
                const cost = carFixCost(car.purchasePrice, part.id);
                const can = M(balance).gte(cost);
                return (
                  <Pressable
                    key={part.id}
                    disabled={!can}
                    onPress={() => {
                      const res = fix(cb.uid, car.uid, part.id);
                      if (!res.ok) Alert.alert("Can't fix", res.reason ?? 'Failed');
                    }}
                    style={[styles.partTile, !can && styles.partTileDisabled]}
                  >
                    <Ionicons name={part.icon} size={22} color={can ? palette.primary : palette.textTertiary} />
                    <Text style={[styles.partLabel, !can && { color: palette.textTertiary }]}>{part.label}</Text>
                    <Text style={[styles.partCost, !can && { color: palette.textTertiary }]}>{formatMoney(cost)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Sell / cancel */}
        <View style={styles.footer}>
          {!car.forSale ? (
            <Pressable
              style={styles.sellBtn}
              onPress={() => {
                Alert.alert(
                  'List for sale?',
                  `Market price: ${formatMoney(marketPrice)}\n\nIt will auto-sell in 30-45 minutes and the proceeds go to your balance.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'List for sale',
                      onPress: () => {
                        const res = listForSale(cb.uid, car.uid);
                        if (!res.ok) Alert.alert("Can't list", res.reason ?? 'Failed');
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="pricetag-outline" size={18} color="#FFFFFF" />
              <Text style={styles.sellBtnText}>Sell for {formatMoney(marketPrice)}</Text>
            </Pressable>
          ) : (
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                Alert.alert('Cancel listing?', 'The car will go back to your fleet.', [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes, cancel', style: 'destructive', onPress: () => cancelListing(cb.uid, car.uid) },
                ]);
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel listing</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title, color: palette.textPrimary, flex: 1, textAlign: 'center' },
  heroImg: { marginHorizontal: spacing.lg, height: 200, backgroundColor: '#FFFFFF', borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...shadow.card },
  heroImageInner: { width: '100%', height: '100%' },
  saleBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, margin: spacing.lg, padding: spacing.md, backgroundColor: '#FEF3C7', borderRadius: radius.lg },
  saleBannerTitle: { ...typography.bodyMedium, color: '#92400E', fontWeight: '700' },
  saleBannerSub: { ...typography.caption, color: '#92400E', marginTop: 2 },
  saleBarTrack: { height: 4, backgroundColor: 'rgba(146,64,14,0.15)', borderRadius: 2, marginTop: spacing.sm, overflow: 'hidden' },
  saleBarFill: { height: '100%', backgroundColor: '#F59E0B' },
  section: { padding: spacing.lg, marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  sectionTitle: { ...typography.title, color: palette.textPrimary, marginBottom: spacing.sm },
  sectionDesc: { ...typography.caption, color: palette.textSecondary, marginBottom: spacing.md },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  specLabel: { ...typography.bodyMedium, color: palette.textSecondary },
  specValue: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '600' },
  conditionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  conditionTrack: { flex: 1, height: 8, backgroundColor: palette.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  conditionFill: { height: '100%', borderRadius: 4 },
  conditionPct: { ...typography.caption, color: palette.textPrimary, fontWeight: '700', minWidth: 40, textAlign: 'right' },
  marketCard: { alignItems: 'center', gap: spacing.xs },
  marketLabel: { ...typography.caption, color: palette.textSecondary },
  marketPrice: { ...typography.hero, color: palette.textPrimary },
  profitPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, marginTop: spacing.xs },
  profitText: { ...typography.bodyMedium, fontWeight: '700' },
  partsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  partTile: { flex: 1, minWidth: '47%', alignItems: 'center', gap: 4, paddingVertical: spacing.md, backgroundColor: palette.surfaceAlt, borderRadius: radius.md },
  partTileDisabled: { opacity: 0.5 },
  partLabel: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '600' },
  partCost: { ...typography.caption, color: palette.primary, fontWeight: '700' },
  footer: { padding: spacing.lg },
  sellBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: palette.success, borderRadius: radius.pill },
  sellBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  cancelBtn: { padding: spacing.md, backgroundColor: palette.surfaceAlt, borderRadius: radius.pill, alignItems: 'center' },
  cancelBtnText: { ...typography.bodyMedium, color: palette.textSecondary, fontWeight: '600' },
});
