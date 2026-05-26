import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame } from '../../../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../../../src/theme';
import { formatMoney, M } from '../../../src/lib/money';
import { CAR_CATALOG, generateUsedCarOffer } from '../../../src/content/carBusiness';
import { getCarImage } from '../../../src/content/carImages';
import { ConfirmModal } from '../../../src/components/ConfirmModal';
import { BuyCarModal } from '../../../src/components/BuyCarModal';
import { ConditionBar } from '../../../src/components/ConditionBar';

const SHOWROOM_LABEL: Record<'mass' | 'luxury' | 'premium', string> = {
  mass: 'mass-market',
  luxury: 'luxury',
  premium: 'premium',
};

export default function UsedCarMarket() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cb = useGame((s) => s.state.carBusinesses.find((b) => b.uid === id));
  const balance = useGame((s) => s.state.balance);
  const buy = useGame((s) => s.buyCarForInventory);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    icon: keyof typeof Ionicons.glyphMap;
    variant: 'default' | 'success' | 'danger' | 'warning';
  } | null>(null);
  const [pendingBuy, setPendingBuy] = useState<{
    id: string;
    name: string;
    emoji: string;
    segment: 'mass' | 'luxury' | 'premium';
    condition: number;
    askPrice: number;
  } | null>(null);

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

      {cb.inventory.length >= cb.showroomCapacity ? (
        <View style={styles.fullBanner}>
          <Ionicons name="warning" size={16} color="#92400E" />
          <Text style={styles.fullBannerText}>Showroom is full ({cb.inventory.length}/{cb.showroomCapacity}) — sell or list a car first</Text>
        </View>
      ) : (
        <View style={styles.capacityHint}>
          <Text style={styles.capacityHintText}>Capacity: {cb.inventory.length}/{cb.showroomCapacity}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {(() => {
          // De-dupe offers and hide any cars the user already owns
          const ownedIds = new Set(cb.inventory.map((c) => c.catalogId));
          const seen = new Set<string>();
          const visibleOffers = offers.filter((o) => {
            if (ownedIds.has(o.id)) return false;
            if (seen.has(o.id)) return false;
            seen.add(o.id);
            return true;
          });
          if (visibleOffers.length === 0) {
            return (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={36} color={palette.success} />
                <Text style={styles.emptyTitle}>All caught up</Text>
                <Text style={styles.emptyDesc}>
                  You already own every available {SHOWROOM_LABEL[cb.specialization]} model. Sell one to refresh the market.
                </Text>
              </View>
            );
          }
          return visibleOffers.map((offer, i) => {
            const can = M(balance).gte(offer.askPrice);
            const full = cb.inventory.length >= cb.showroomCapacity;
            return (
              <View key={`${offer.id}-${i}`} style={styles.carCard}>
                <CarImage carId={offer.id} emoji={offer.emoji} segment={offer.segment} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.carName}>{offer.name}</Text>
                  <View>
                    <Text style={styles.conditionLabel}>Vehicle condition</Text>
                    <ConditionBar value={offer.condition} height={6} />
                  </View>
                  <Text style={styles.carPrice}>{formatMoney(offer.askPrice)}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    if (full) {
                      setModal({
                        title: 'Showroom is full',
                        message: 'Your showroom is at capacity. Sell or list a car first to make room.',
                        icon: 'warning',
                        variant: 'warning',
                      });
                      return;
                    }
                    // Open buy confirmation modal — actual purchase happens on confirm
                    setPendingBuy({
                      id: offer.id,
                      name: offer.name,
                      emoji: offer.emoji,
                      segment: offer.segment,
                      condition: offer.condition,
                      askPrice: offer.askPrice,
                    });
                  }}
                  style={[styles.addBtn, full && styles.addBtnDisabled]}
                >
                  <Ionicons name="add" size={18} color={full ? palette.textTertiary : '#FFFFFF'} />
                </Pressable>
              </View>
            );
          });
        })()}
        <View style={{ height: 80 }} />
      </ScrollView>

      <ConfirmModal
        visible={!!modal}
        title={modal?.title ?? ''}
        message={modal?.message}
        icon={modal?.icon}
        variant={modal?.variant ?? 'default'}
        confirmLabel="OK"
        onCancel={() => setModal(null)}
        onConfirm={() => setModal(null)}
      />

      {pendingBuy ? (
        <BuyCarModal
          visible={!!pendingBuy}
          carId={pendingBuy.id}
          name={pendingBuy.name}
          emoji={pendingBuy.emoji}
          segment={pendingBuy.segment}
          condition={pendingBuy.condition}
          askPrice={pendingBuy.askPrice}
          canAfford={M(balance).gte(pendingBuy.askPrice)}
          onCancel={() => setPendingBuy(null)}
          onConfirm={() => {
            const offer = pendingBuy;
            setPendingBuy(null);
            const ok = buy(cb.uid, offer.id, offer.askPrice.toString(), offer.condition);
            if (!ok) {
              setModal({
                title: "Couldn't add car",
                message: 'Something went wrong. Please try again.',
                icon: 'alert-circle',
                variant: 'danger',
              });
            } else {
              setModal({
                title: 'Added to showroom!',
                message: `${offer.name} added for ${formatMoney(offer.askPrice)}. Go to the showroom to fix it up or list it for sale.`,
                icon: 'checkmark-circle',
                variant: 'success',
              });
            }
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function CarImage({ carId, emoji, segment }: { carId: string; emoji: string; segment: 'mass' | 'luxury' | 'premium' }) {
  const local = getCarImage(carId);
  if (local) {
    return (
      <View style={styles.carImageBox}>
        <Image source={local} style={styles.carImage} resizeMode="contain" />
      </View>
    );
  }
  // No local PNG available — show a styled card with segment color theming
  const bg =
    segment === 'premium' ? '#FEF3C7' :
    segment === 'luxury'  ? '#E0E7FF' :
                            '#F1F5F9';
  return (
    <View style={[styles.carImageBox, { backgroundColor: bg }]}>
      <Text style={styles.carEmoji}>{emoji}</Text>
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
  carImageBox: { width: 110, height: 80, borderRadius: radius.md, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  carImage: { width: 110, height: 80 },
  carImageLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceAlt },
  carEmoji: { fontSize: 38 },
  carName: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '600' },
  conditionLabel: { ...typography.micro, color: palette.textTertiary },
  conditionTrack: { height: 6, marginTop: 4, borderRadius: 3, backgroundColor: palette.surfaceAlt, overflow: 'hidden' },
  conditionFill: { height: '100%', borderRadius: 3 },
  carPrice: { ...typography.title, color: palette.textPrimary, marginTop: 4 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { backgroundColor: palette.surfaceAlt },
  fullBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: '#FEF3C7', borderRadius: radius.md },
  fullBannerText: { ...typography.caption, color: '#92400E', flex: 1, fontWeight: '600' },
  capacityHint: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  capacityHintText: { ...typography.micro, color: palette.textTertiary },
  emptyState: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, marginHorizontal: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.lg },
  emptyTitle: { ...typography.title, color: palette.textPrimary, marginTop: spacing.sm },
  emptyDesc: { ...typography.caption, color: palette.textSecondary, textAlign: 'center' },
});
