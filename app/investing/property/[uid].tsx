import React, { useMemo } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame } from '../../../src/store/gameStore';
import { useBottomPadding } from '../../../src/hooks/useBottomPadding';
import { PROPERTIES, PROPERTY_UPGRADES, propertyMarketValue, propertyRentPerHour } from '../../../src/content/realEstate';
import { formatMoney, M } from '../../../src/lib/money';
import { palette, radius, shadow, spacing, typography } from '../../../src/theme';

export default function PropertyDetailScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const state = useGame((s) => s.state);
  const upgradeProperty = useGame((s) => s.upgradeProperty);
  const sellProperty = useGame((s) => s.sellProperty);
  const bottomPad = useBottomPadding();
  const balance = M(state.balance);

  const prop = state.properties.find((p) => p.uid === uid);
  const tmpl = prop ? PROPERTIES.find((t) => t.id === prop.templateId) : null;

  if (!prop || !tmpl) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </Pressable>
        </View>
        <Text style={{ color: palette.textPrimary, padding: spacing.lg }}>Property not found.</Text>
      </SafeAreaView>
    );
  }

  const marketValue = propertyMarketValue(tmpl, prop.upgrades);
  const rentHr = propertyRentPerHour(tmpl, prop.upgrades);
  const proceeds = M(marketValue).times(1 - tmpl.salesTaxRate);

  const handleSell = () => {
    Alert.alert(
      'Sell property?',
      `Market value: ${formatMoney(marketValue)}\nSales tax (${(tmpl.salesTaxRate * 100).toFixed(0)}%): -${formatMoney(M(marketValue).times(tmpl.salesTaxRate))}\nYou receive: ${formatMoney(proceeds)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sell', style: 'destructive',
          onPress: () => { sellProperty(uid); router.back(); },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </Pressable>
          <Text style={styles.heading} numberOfLines={1}>{tmpl.name}</Text>
        </View>

        <Image source={{ uri: tmpl.imageUrl }} style={styles.heroImage} resizeMode="cover" />

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{formatMoney(rentHr)}/hr</Text>
              <Text style={styles.statLbl}>Income per hour</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{formatMoney(rentHr * 24)}</Text>
              <Text style={styles.statLbl}>Per day</Text>
            </View>
          </View>
          <View style={styles.statRowBottom}>
            <Ionicons name="location-outline" size={14} color={palette.textSecondary} />
            <Text style={styles.locText}>{tmpl.city}, {tmpl.country}</Text>
          </View>
        </View>

        {/* Market value */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Market value</Text>
          <Text style={styles.valueMain}>{formatMoney(marketValue)}</Text>
          <Text style={styles.valueSub}>Purchase price: {formatMoney(tmpl.price)}</Text>
          {prop.upgrades.length > 0 ? (
            <Text style={styles.valueBoost}>+{((marketValue / tmpl.price - 1) * 100).toFixed(1)}% from improvements</Text>
          ) : null}
        </View>

        {/* Improvements */}
        <View style={styles.improvSection}>
          <Text style={styles.improvTitle}>Improvements</Text>
          <Text style={styles.improvSubtitle}>Boost market value and rental income</Text>
          <View style={styles.improvGrid}>
            {PROPERTY_UPGRADES.map((u) => {
              const applied = prop.upgrades.includes(u.id);
              const cost = M(prop.purchasePrice).times(u.costFraction);
              const canAfford = balance.gte(cost);
              return (
                <Pressable
                  key={u.id}
                  onPress={() => {
                    if (applied) return;
                    if (!canAfford) { Alert.alert("Can't afford", `This improvement costs ${formatMoney(cost)}.`); return; }
                    upgradeProperty(uid, u.id);
                  }}
                  style={[styles.improvCard, applied && styles.improvCardDone]}
                >
                  <View style={[styles.improvIcon, applied && styles.improvIconDone]}>
                    <Ionicons name={u.icon as any} size={22} color={applied ? '#FFFFFF' : palette.primary} />
                  </View>
                  <Text style={[styles.improvLabel, applied && styles.improvLabelDone]}>{u.label}</Text>
                  {applied ? (
                    <View style={styles.doneChip}>
                      <Ionicons name="checkmark" size={10} color={palette.success} />
                      <Text style={styles.doneText}>Done</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.improvBoost}>+{(u.rentBoost * 100).toFixed(0)}% rent</Text>
                      <Text style={[styles.improvCost, !canAfford && { color: palette.danger }]}>{formatMoney(cost)}</Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sell */}
        <View style={styles.sellSection}>
          <Pressable onPress={handleSell} style={styles.sellBtn}>
            <Text style={styles.sellBtnText}>Sell property</Text>
          </Pressable>
          <Text style={styles.sellHint}>Sales tax: {(tmpl.salesTaxRate * 100).toFixed(0)}% · You receive {formatMoney(proceeds)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  heading: { ...typography.title, color: palette.textPrimary, flex: 1 },
  heroImage: { width: '100%', height: 220 },
  statsCard: { margin: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { ...typography.title, color: palette.textPrimary },
  statLbl: { ...typography.micro, color: palette.textTertiary, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: palette.border },
  statRowBottom: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.border },
  locText: { ...typography.caption, color: palette.textSecondary },
  valueCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card },
  valueLabel: { ...typography.caption, color: palette.textSecondary },
  valueMain: { ...typography.display, color: palette.textPrimary, marginTop: 2 },
  valueSub: { ...typography.caption, color: palette.textTertiary, marginTop: 4 },
  valueBoost: { ...typography.caption, color: palette.success, marginTop: 4 },
  improvSection: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  improvTitle: { ...typography.title, color: palette.textPrimary, marginBottom: 4 },
  improvSubtitle: { ...typography.caption, color: palette.textSecondary, marginBottom: spacing.md },
  improvGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  improvCard: { width: '47%', padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card, alignItems: 'center', gap: 6 },
  improvCardDone: { backgroundColor: palette.successSoft },
  improvIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  improvIconDone: { backgroundColor: palette.success },
  improvLabel: { ...typography.caption, color: palette.textPrimary, textAlign: 'center', fontWeight: '600' },
  improvLabelDone: { color: palette.success },
  improvBoost: { ...typography.micro, color: palette.success },
  improvCost: { ...typography.micro, color: palette.textSecondary },
  doneChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  doneText: { ...typography.micro, color: palette.success, fontWeight: '700' },
  sellSection: { margin: spacing.lg, gap: spacing.sm },
  sellBtn: { backgroundColor: palette.danger, paddingVertical: 14, borderRadius: radius.lg, alignItems: 'center' },
  sellBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  sellHint: { ...typography.caption, color: palette.textSecondary, textAlign: 'center' },
});
