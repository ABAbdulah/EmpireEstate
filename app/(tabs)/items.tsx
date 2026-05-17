import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../../src/store/gameStore';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { formatMoney, M } from '../../src/lib/money';
import { ITEMS, COLLECTIONS, ItemCategory } from '../../src/content/items';

const HERO_TILES: Array<{ key: ItemCategory; label: string; gradient: [string, string]; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'garage', label: 'Garage', gradient: ['#374151', '#0F172A'], icon: 'car-sport' },
  { key: 'hangar', label: 'Hangar', gradient: ['#5B4636', '#2A1F18'], icon: 'airplane' },
  { key: 'harbor', label: 'Harbor', gradient: ['#0E5A85', '#072540'], icon: 'boat' },
];

export default function ItemsScreen() {
  const state = useGame((s) => s.state);
  const buy = useGame((s) => s.buyItem);
  const bottomPad = useBottomPadding();
  const [openCategory, setOpenCategory] = useState<ItemCategory | null>(null);

  const ownedByCategory = useMemo(() => {
    const map: Record<ItemCategory, number> = { garage: 0, hangar: 0, harbor: 0 };
    for (const it of state.items) {
      const t = ITEMS.find((i) => i.id === it.templateId);
      if (t) map[t.category] += 1;
    }
    return map;
  }, [state.items]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <Text style={styles.heading}>Items</Text>

        <View style={styles.heroRow}>
          {HERO_TILES.map((tile) => (
            <Pressable key={tile.key} onPress={() => setOpenCategory(openCategory === tile.key ? null : tile.key)} style={{ flex: 1 }}>
              <LinearGradient colors={tile.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroTile}>
                <Ionicons name={tile.icon} size={28} color="rgba(255,255,255,0.85)" style={{ alignSelf: 'flex-end' }} />
                <Text style={styles.heroTileLabel}>{tile.label}</Text>
                <Text style={styles.heroTileCount}>{ownedByCategory[tile.key]} owned</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <LinearGradient colors={['#E0F2FE', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.shopStrip}>
          <ShopCell icon="storefront-outline" label="Car Showroom" />
          <ShopCell icon="business-outline" label="Aircraft Shop" />
          <ShopCell icon="boat-outline" label="Yacht Shop" />
        </LinearGradient>

        {openCategory ? (
          <View style={styles.itemList}>
            <Text style={styles.sectionTitle}>{HERO_TILES.find(t => t.key === openCategory)?.label} catalog</Text>
            {ITEMS.filter((i) => i.category === openCategory).map((it) => {
              const can = M(state.balance).gte(it.price);
              const owned = state.items.some((o) => o.templateId === it.id);
              return (
                <View key={it.id} style={styles.itemRow}>
                  <Text style={styles.itemEmoji}>{it.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{it.name}</Text>
                    <Text style={styles.itemTier}>Tier {it.tier}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemPrice}>{formatMoney(it.price)}</Text>
                    <Pressable
                      disabled={!can || owned}
                      onPress={() => {
                        const ok = buy(it.id, it.price);
                        if (!ok) Alert.alert("Can't buy", `${it.name} costs ${formatMoney(it.price)}.`);
                      }}
                      style={[styles.itemBuyBtn, (!can || owned) && styles.itemBuyBtnDisabled]}
                    >
                      <Text style={[styles.itemBuyText, (!can || owned) && styles.itemBuyTextDisabled]}>{owned ? 'Owned' : 'Buy'}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        <Text style={styles.collectionsHeading}>Collections</Text>
        <View style={styles.collectionsGrid}>
          {COLLECTIONS.map((c) => {
            const owned = (state.collections[c.id]?.length ?? 0);
            return (
              <View key={c.id} style={styles.collectionCard}>
                <Text style={styles.collectionEmoji}>{c.emoji}</Text>
                <Text style={styles.collectionName}>{c.name}</Text>
                <Text style={styles.collectionMeta}>{owned} of {c.totalItems}</Text>
                <View style={styles.collectionProgressTrack}>
                  <View style={[styles.collectionProgressFill, { width: `${(owned / c.totalItems) * 100}%` }]} />
                </View>
                <Text style={styles.collectionBonus}>{c.passiveBonus}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ShopCell({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <Pressable style={styles.shopCell}>
      <Ionicons name={icon} size={28} color="#FFFFFF" />
      <Text style={styles.shopLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  heading: { ...typography.hero, color: palette.textPrimary },
  heroRow: { flexDirection: 'row', gap: spacing.md },
  heroTile: { aspectRatio: 1, borderRadius: radius.lg, padding: spacing.md, justifyContent: 'space-between' },
  heroTileLabel: { ...typography.title, color: '#FFFFFF', marginTop: spacing.sm },
  heroTileCount: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  shopStrip: { flexDirection: 'row', borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  shopCell: { flex: 1, alignItems: 'center', padding: spacing.md, gap: 4 },
  shopLabel: { ...typography.caption, color: '#FFFFFF', fontWeight: '600' },
  itemList: { gap: spacing.sm },
  sectionTitle: { ...typography.title, color: palette.textPrimary },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.md, ...shadow.card },
  itemEmoji: { fontSize: 32 },
  itemName: { ...typography.bodyMedium, color: palette.textPrimary },
  itemTier: { ...typography.micro, color: palette.textTertiary },
  itemPrice: { ...typography.bodyMedium, color: palette.textPrimary, marginBottom: 4 },
  itemBuyBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: palette.primary },
  itemBuyBtnDisabled: { backgroundColor: palette.surfaceAlt },
  itemBuyText: { ...typography.caption, color: '#FFFFFF', fontWeight: '700' },
  itemBuyTextDisabled: { color: palette.textTertiary },
  collectionsHeading: { ...typography.headline, color: palette.textPrimary },
  collectionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  collectionCard: { width: '47%', padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card, gap: 4 },
  collectionEmoji: { fontSize: 28 },
  collectionName: { ...typography.bodyMedium, color: palette.textPrimary, marginTop: 4 },
  collectionMeta: { ...typography.caption, color: palette.textSecondary },
  collectionProgressTrack: { height: 4, borderRadius: 2, backgroundColor: palette.surfaceAlt, overflow: 'hidden', marginTop: 4 },
  collectionProgressFill: { height: '100%', backgroundColor: palette.primary },
  collectionBonus: { ...typography.micro, color: palette.primary, marginTop: 6 },
});
