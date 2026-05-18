import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame, aggregateRentPerHour } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { PROPERTIES, propertyMarketValue, propertyRentPerHour } from '../../src/content/realEstate';
import { formatMoney, M } from '../../src/lib/money';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';

export default function MyPropertyScreen() {
  const state = useGame((s) => s.state);
  const bottomPad = useBottomPadding();
  const rentPerHour = aggregateRentPerHour(state);

  const owned = useMemo(() =>
    state.properties.map((p) => {
      const tmpl = PROPERTIES.find((t) => t.id === p.templateId);
      if (!tmpl) return null;
      return { ...p, tmpl, marketValue: propertyMarketValue(tmpl, p.upgrades), rentHr: propertyRentPerHour(tmpl, p.upgrades) };
    }).filter((x): x is NonNullable<typeof x> => x !== null),
    [state.properties],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.heading}>My Property</Text>
        <Pressable onPress={() => router.push('/investing/buy-property' as any)} style={styles.addBtn}>
          <Ionicons name="add" size={20} color={palette.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total rental income</Text>
          <Text style={styles.summaryValue}>{formatMoney(rentPerHour)}</Text>
          <Text style={styles.summaryUnit}>per hour</Text>
          <View style={styles.summaryFooter}>
            <View style={styles.sumStat}>
              <Text style={styles.sumStatNum}>{owned.length}</Text>
              <Text style={styles.sumStatLbl}>Properties</Text>
            </View>
            <View style={styles.sumDivider} />
            <View style={styles.sumStat}>
              <Text style={styles.sumStatNum}>{formatMoney(M(rentPerHour).times(24))}</Text>
              <Text style={styles.sumStatLbl}>Per day</Text>
            </View>
            <View style={styles.sumDivider} />
            <View style={styles.sumStat}>
              <Text style={styles.sumStatNum}>{formatMoney(M(rentPerHour).times(24 * 30))}</Text>
              <Text style={styles.sumStatLbl}>Per month</Text>
            </View>
          </View>
        </View>

        {owned.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={48} color={palette.textTertiary} />
            <Text style={styles.emptyTitle}>No properties yet</Text>
            <Text style={styles.emptySub}>Head to the real estate market to buy your first property.</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.push('/investing/buy-property' as any)}>
              <Text style={styles.emptyBtnText}>Browse market</Text>
            </Pressable>
          </View>
        ) : (
          owned.map((entry) => (
            <Pressable key={entry.uid} style={styles.propCard} onPress={() => router.push(`/investing/property/${entry.uid}` as any)}>
              <Image source={{ uri: entry.tmpl.imageUrl }} style={styles.propImage} resizeMode="cover" />
              <View style={styles.propBody}>
                <Text style={styles.propName}>{entry.tmpl.name}</Text>
                <View style={styles.propLocRow}>
                  <Ionicons name="location-outline" size={12} color={palette.textTertiary} />
                  <Text style={styles.propLoc}>{entry.tmpl.city}, {entry.tmpl.country}</Text>
                </View>
                <View style={styles.propStatsRow}>
                  <View style={styles.propStat}>
                    <Text style={styles.propStatNum}>{formatMoney(entry.marketValue)}</Text>
                    <Text style={styles.propStatLbl}>Market value</Text>
                  </View>
                  <View style={styles.propStat}>
                    <Text style={[styles.propStatNum, { color: palette.success }]}>{formatMoney(entry.rentHr)}/hr</Text>
                    <Text style={styles.propStatLbl}>Rent income</Text>
                  </View>
                </View>
                {entry.upgrades.length > 0 ? (
                  <View style={styles.upgradesRow}>
                    <Ionicons name="star" size={12} color={palette.primary} />
                    <Text style={styles.upgradesText}>{entry.upgrades.length} improvements applied</Text>
                  </View>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} style={{ alignSelf: 'center', marginRight: spacing.md }} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  heading: { ...typography.hero, color: palette.textPrimary, flex: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md },
  summaryCard: { backgroundColor: palette.primary, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card },
  summaryLabel: { ...typography.caption, color: '#BFD3FF' },
  summaryValue: { ...typography.display, color: '#FFFFFF', marginTop: 2 },
  summaryUnit: { ...typography.caption, color: '#BFD3FF' },
  summaryFooter: { flexDirection: 'row', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  sumStat: { flex: 1, alignItems: 'center' },
  sumStatNum: { ...typography.bodyMedium, color: '#FFFFFF' },
  sumStatLbl: { ...typography.micro, color: '#BFD3FF', marginTop: 2 },
  sumDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  propCard: { flexDirection: 'row', backgroundColor: palette.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadow.card },
  propImage: { width: 100, height: 100 },
  propBody: { flex: 1, padding: spacing.md, gap: spacing.xs },
  propName: { ...typography.title, color: palette.textPrimary },
  propLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  propLoc: { ...typography.micro, color: palette.textTertiary },
  propStatsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  propStat: {},
  propStatNum: { ...typography.bodyMedium, color: palette.textPrimary },
  propStatLbl: { ...typography.micro, color: palette.textTertiary, marginTop: 2 },
  upgradesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  upgradesText: { ...typography.micro, color: palette.primary },
  empty: { alignItems: 'center', paddingTop: 48, gap: spacing.md },
  emptyTitle: { ...typography.title, color: palette.textPrimary },
  emptySub: { ...typography.body, color: palette.textSecondary, textAlign: 'center' },
  emptyBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: palette.primary, borderRadius: radius.pill },
  emptyBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
});
