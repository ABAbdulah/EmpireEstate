import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame, computeNetworth } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { PROPERTIES, PropertyTemplate } from '../../src/content/realEstate';
import { formatMoney, M } from '../../src/lib/money';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';

type Sort = 'Cheap first' | 'Expensive first';

const TYPE_LABELS: Record<string, string> = {
  studio: 'Studio', house: 'House', apartment: 'Apartment', villa: 'Villa',
  farmhouse: 'Farmhouse', condo: 'Condo', penthouse: 'Penthouse',
  building: 'Building', mansion: 'Mansion', island: 'Island Estate',
};

const TYPE_ICONS: Record<string, string> = {
  studio: 'business-outline', house: 'home-outline', apartment: 'business-outline',
  villa: 'home', farmhouse: 'leaf-outline', condo: 'grid-outline',
  penthouse: 'arrow-up-circle-outline', building: 'business', mansion: 'home',
  island: 'water-outline',
};

export default function BuyPropertyScreen() {
  const state = useGame((s) => s.state);
  const buyProperty = useGame((s) => s.buyProperty);
  const bottomPad = useBottomPadding();
  const networth = useMemo(() => computeNetworth(state), [state]);
  const balance = M(state.balance);
  const [sort, setSort] = useState<Sort>('Cheap first');

  const available = PROPERTIES.filter((p) => M(networth).gte(p.unlockNetworth));
  const locked = PROPERTIES.filter((p) => M(networth).lt(p.unlockNetworth));
  const sorted = [...available].sort((a, b) => sort === 'Cheap first' ? a.price - b.price : b.price - a.price);

  const ownedIds = new Set(state.properties.map((p) => p.templateId));

  const handleBuy = (prop: PropertyTemplate) => {
    if (ownedIds.has(prop.id)) {
      Alert.alert('Already owned', 'You already own this property.');
      return;
    }
    if (balance.lt(prop.price)) {
      Alert.alert("Can't buy", `You need ${formatMoney(prop.price)} to buy this property.`);
      return;
    }
    Alert.alert(
      `Buy ${prop.name}?`,
      `Price: ${formatMoney(prop.price)}\nRental income: ${formatMoney(prop.rentPerHour)}/hr`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy', onPress: () => { buyProperty(prop.id); router.push('/investing/my-property' as any); } },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Real Estate Market</Text>
          <Text style={styles.subheading}>Balance: {formatMoney(balance)}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll} contentContainerStyle={styles.sortRow}>
        {(['Expensive first', 'Cheap first'] as Sort[]).map((s) => (
          <Pressable key={s} onPress={() => setSort(s)} style={[styles.sortPill, sort === s && styles.sortPillActive]}>
            <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        {sorted.map((prop) => {
          const alreadyOwned = ownedIds.has(prop.id);
          const canAfford = balance.gte(prop.price);
          return (
            <View key={prop.id} style={styles.propCard}>
              <Image source={{ uri: prop.imageUrl }} style={styles.propImage} resizeMode="cover" />
              <View style={styles.propBody}>
                <View style={styles.propTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.propPrice}>{formatMoney(prop.price)}</Text>
                    <View style={styles.propLocRow}>
                      <Ionicons name="location-outline" size={14} color={palette.textTertiary} />
                      <Text style={styles.propLoc}>{prop.city}, {prop.country}</Text>
                    </View>
                    <View style={styles.propTagRow}>
                      <View style={styles.propTag}>
                        <Ionicons name={TYPE_ICONS[prop.type] as any} size={12} color={palette.primary} />
                        <Text style={styles.propTagText}>{TYPE_LABELS[prop.type]}</Text>
                      </View>
                      {prop.bedrooms ? <View style={styles.propTag}><Ionicons name="bed-outline" size={12} color={palette.textSecondary} /><Text style={styles.propTagText}>{prop.bedrooms} bd</Text></View> : null}
                      {prop.sqft ? <View style={styles.propTag}><Text style={styles.propTagText}>{prop.sqft.toLocaleString()} sqft</Text></View> : null}
                    </View>
                  </View>
                  {alreadyOwned ? (
                    <View style={styles.ownedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={palette.success} />
                      <Text style={styles.ownedText}>Owned</Text>
                    </View>
                  ) : (
                    <Pressable onPress={() => handleBuy(prop)} style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}>
                      <Text style={[styles.buyBtnText, !canAfford && styles.buyBtnTextDisabled]}>Buy</Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.propRentRow}>
                  <Ionicons name="cash-outline" size={14} color={palette.success} />
                  <Text style={styles.propRentPerHr}>{formatMoney(prop.rentPerHour)}/hr</Text>
                  <Text style={styles.propRentSep}>·</Text>
                  <Text style={styles.propRentPerDay}>{formatMoney(prop.rentPerHour * 24)}/day</Text>
                </View>
              </View>
            </View>
          );
        })}

        {locked.length > 0 ? (
          <View style={styles.lockedSection}>
            <View style={styles.lockedHeader}>
              <Ionicons name="lock-closed-outline" size={14} color={palette.textTertiary} />
              <Text style={styles.lockedHeaderText}>{locked.length} properties locked</Text>
            </View>
            {locked.map((prop) => (
              <View key={prop.id} style={[styles.propCard, { opacity: 0.5 }]}>
                <Image source={{ uri: prop.imageUrl }} style={styles.propImage} resizeMode="cover" />
                <View style={styles.propBody}>
                  <View style={styles.propTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.propPrice}>{formatMoney(prop.price)}</Text>
                      <View style={styles.propLocRow}>
                        <Ionicons name="location-outline" size={14} color={palette.textTertiary} />
                        <Text style={styles.propLoc}>{prop.city}, {prop.country}</Text>
                      </View>
                    </View>
                    <View style={styles.lockedBadge}>
                      <Ionicons name="lock-closed" size={14} color={palette.textTertiary} />
                      <Text style={styles.lockedBadgeText}>{formatMoney(prop.unlockNetworth)} NW</Text>
                    </View>
                  </View>
                  <View style={styles.propRentRow}>
                    <Ionicons name="cash-outline" size={14} color={palette.textTertiary} />
                    <Text style={[styles.propRentPerHr, { color: palette.textTertiary }]}>{formatMoney(prop.rentPerHour)}/hr</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  heading: { ...typography.hero, color: palette.textPrimary },
  subheading: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  sortScroll: { flexGrow: 0 },
  sortRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  sortPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: palette.surfaceAlt },
  sortPillActive: { backgroundColor: palette.primary },
  sortText: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  sortTextActive: { color: '#FFFFFF' },
  content: { padding: spacing.lg, gap: spacing.lg },
  propCard: { backgroundColor: palette.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadow.card },
  propImage: { width: '100%', height: 200 },
  propBody: { padding: spacing.md, gap: spacing.sm },
  propTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  propPrice: { ...typography.display, color: palette.textPrimary },
  propLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  propLoc: { ...typography.caption, color: palette.textSecondary },
  propTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  propTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: palette.surfaceAlt, borderRadius: radius.pill },
  propTagText: { ...typography.micro, color: palette.textSecondary },
  propRentRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: palette.surfaceAlt },
  propRentPerHr: { ...typography.bodyMedium, color: palette.success },
  propRentSep: { ...typography.caption, color: palette.textTertiary },
  propRentPerDay: { ...typography.caption, color: palette.success },
  buyBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: palette.primary, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  buyBtnDisabled: { backgroundColor: palette.surfaceAlt },
  buyBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  buyBtnTextDisabled: { color: palette.textTertiary },
  ownedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: palette.successSoft, borderRadius: radius.pill },
  ownedText: { ...typography.caption, color: palette.success, fontWeight: '700' },
  lockedSection: { gap: spacing.md },
  lockedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lockedHeaderText: { ...typography.caption, color: palette.textTertiary },
  lockedBadge: { flexDirection: 'column', alignItems: 'center', gap: 2 },
  lockedBadgeText: { ...typography.micro, color: palette.textTertiary, textAlign: 'center' },
});
