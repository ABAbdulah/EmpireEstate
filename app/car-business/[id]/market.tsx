import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame } from '../../../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../../../src/theme';
import { formatMoney, M } from '../../../src/lib/money';
import { CAR_CATALOG, generateUsedCarOffer } from '../../../src/content/carBusiness';

export default function UsedCarMarket() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cb = useGame((s) => s.state.carBusinesses.find((b) => b.uid === id));
  const balance = useGame((s) => s.state.balance);
  const buy = useGame((s) => s.buyCarForInventory);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const offers = useMemo(() => {
    if (!cb) return [];
    return Array.from({ length: 14 }).map((_, i) => generateUsedCarOffer(cb.specialization, i + 1 + refreshKey * 17)!).filter(Boolean);
  }, [cb?.specialization, refreshKey]);

  if (!cb) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Showroom not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Used car market</Text>
          <Text style={styles.balance}>Balance: {formatMoney(balance)}</Text>
        </View>
        <Pressable onPress={() => setRefreshKey((k) => k + 1)} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={palette.primary} />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip label="Favorites" active={filter === 'favorites'} onPress={() => setFilter('favorites')} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {offers.map((offer, i) => {
          const can = M(balance).gte(offer.askPrice);
          const full = cb.inventory.length >= cb.showroomCapacity;
          return (
            <View key={`${offer.id}-${i}`} style={styles.carCard}>
              <CarImage imageUrl={offer.imageUrl} emoji={offer.emoji} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.carName}>{offer.name}</Text>
                <View>
                  <Text style={styles.conditionLabel}>Vehicle condition</Text>
                  <View style={styles.conditionTrack}>
                    <View style={[styles.conditionFill, conditionFillStyle(offer.condition)]} />
                  </View>
                </View>
                <Text style={styles.carPrice}>{formatMoney(offer.askPrice)}</Text>
              </View>
              <Pressable
                disabled={!can || full}
                onPress={() => {
                  const ok = buy(cb.uid, offer.id, offer.askPrice.toString(), offer.condition);
                  if (!ok) Alert.alert("Can't add", full ? 'Showroom is full — expand or sell a car first.' : 'Insufficient balance.');
                }}
                style={[styles.addBtn, (!can || full) && styles.addBtnDisabled]}
              >
                <Ionicons name="add" size={18} color={(!can || full) ? palette.textTertiary : '#FFFFFF'} />
              </Pressable>
            </View>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CarImage({ imageUrl, emoji }: { imageUrl: string; emoji: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <View style={styles.carImageBox}>
      {!imgFailed ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.carImage}
          resizeMode="cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <Text style={styles.carEmoji}>{emoji}</Text>
      )}
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function conditionFillStyle(condition: number) {
  const pct = Math.max(10, condition * 100);
  let bg = '#F5B100';
  if (condition >= 0.75) bg = palette.success;
  else if (condition >= 0.5) bg = '#F5B100';
  else bg = palette.danger;
  return { width: `${pct}%` as `${number}%`, backgroundColor: bg };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft },
  heading: { ...typography.hero, color: palette.textPrimary },
  balance: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: palette.surfaceAlt },
  chipActive: { backgroundColor: '#1F2937' },
  chipLabel: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  chipLabelActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md },
  carCard: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, alignItems: 'center', ...shadow.card },
  carImageBox: { width: 90, height: 80, borderRadius: radius.md, backgroundColor: palette.surfaceAlt, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  carImage: { width: 90, height: 80 },
  carEmoji: { fontSize: 38 },
  carName: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '600' },
  conditionLabel: { ...typography.micro, color: palette.textTertiary },
  conditionTrack: { height: 6, marginTop: 4, borderRadius: 3, backgroundColor: palette.surfaceAlt, overflow: 'hidden' },
  conditionFill: { height: '100%', borderRadius: 3 },
  carPrice: { ...typography.title, color: palette.textPrimary, marginTop: 4 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { backgroundColor: palette.surfaceAlt },
});
