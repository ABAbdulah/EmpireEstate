import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame } from '../src/store/gameStore';
import { MERGER_RECIPES, MergerRecipe, MergerRequirement } from '../src/content/businesses';
import { palette, radius, shadow, spacing, typography } from '../src/theme';
import { formatMoney, M } from '../src/lib/money';

export default function MergersScreen() {
  const state = useGame((s) => s.state);
  const completeMerger = useGame((s) => s.completeMerger);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Business Mergers</Text>
          <Text style={styles.subheading}>Combine businesses for permanent income bonuses</Text>
        </View>
      </View>

      {state.completedMergers.length > 0 && (
        <View style={styles.activeBanner}>
          <Ionicons name="checkmark-circle" size={16} color={palette.success} />
          <Text style={styles.activeBannerText}>
            {state.completedMergers.length} merger{state.completedMergers.length > 1 ? 's' : ''} active
            {' · '}
            +{Math.round((MERGER_RECIPES
              .filter((r) => state.completedMergers.includes(r.id))
              .reduce((a, r) => a * (1 + r.incomeBonus), 1) - 1) * 100)}% total income bonus
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {MERGER_RECIPES.map((recipe) => {
          const done = state.completedMergers.includes(recipe.id);
          const isOpen = expanded === recipe.id;
          const { canAfford, requirementsMet, reqStatus } = checkMerger(recipe, state);
          const allMet = requirementsMet && canAfford;

          return (
            <View key={recipe.id} style={[styles.card, done && styles.cardDone]}>
              {/* Header row */}
              <Pressable style={styles.cardHeader} onPress={() => setExpanded(isOpen ? null : recipe.id)}>
                <Text style={styles.cardEmoji}>{recipe.emoji}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.cardName}>{recipe.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={isOpen ? undefined : 1}>{recipe.description}</Text>
                </View>
                {done ? (
                  <View style={styles.doneBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={palette.success} />
                    <Text style={styles.doneBadgeText}>Active</Text>
                  </View>
                ) : (
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={palette.textTertiary} />
                )}
              </Pressable>

              {/* Bonus pill */}
              <View style={[styles.bonusPill, done && styles.bonusPillDone]}>
                <Ionicons name="trending-up" size={13} color={done ? palette.success : '#F59E0B'} />
                <Text style={[styles.bonusText, done && styles.bonusTextDone]}>{recipe.bonusLabel}</Text>
              </View>

              {/* Expanded details */}
              {isOpen && (
                <View style={styles.expandedBody}>
                  <Text style={styles.reqTitle}>Requirements</Text>
                  {reqStatus.map((r) => (
                    <View key={r.req.businessId} style={styles.reqRow}>
                      <Ionicons
                        name={r.met ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={r.met ? palette.success : palette.textTertiary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reqLabel, r.met && styles.reqLabelMet]}>{r.req.label}</Text>
                        {!r.met && (
                          <Text style={styles.reqCurrent}>Currently Lv {r.currentLevel}</Text>
                        )}
                      </View>
                    </View>
                  ))}

                  <View style={styles.divider} />

                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Investment required</Text>
                    <Text style={[styles.costValue, canAfford ? styles.costAffordable : styles.costExpensive]}>
                      {formatMoney(recipe.investmentCost)}
                    </Text>
                  </View>

                  {!done && (
                    <Pressable
                      style={[styles.mergeBtn, !allMet && styles.mergeBtnDisabled]}
                      onPress={() => {
                        if (!requirementsMet) {
                          Alert.alert('Requirements not met', 'Upgrade the required businesses first.');
                          return;
                        }
                        if (!canAfford) {
                          Alert.alert('Insufficient funds', `You need ${formatMoney(recipe.investmentCost)} to unlock this merger.`);
                          return;
                        }
                        Alert.alert(
                          `Unlock ${recipe.name}?`,
                          `Invest ${formatMoney(recipe.investmentCost)} to permanently unlock ${recipe.bonusLabel}.`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Merge!',
                              onPress: () => {
                                const ok = completeMerger(recipe.id);
                                if (!ok) Alert.alert('Failed', 'Could not complete merger.');
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.mergeBtnText, !allMet && styles.mergeBtnTextDisabled]}>
                        {requirementsMet ? (canAfford ? 'Unlock Merger' : 'Insufficient funds') : 'Requirements not met'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function checkMerger(recipe: MergerRecipe, state: ReturnType<typeof useGame.getState>['state']) {
  const reqStatus = recipe.requirements.map((req: MergerRequirement) => {
    const owned = state.businesses[req.businessId];
    const currentLevel = owned?.level ?? 0;
    return { req, met: currentLevel >= req.minLevel, currentLevel };
  });
  const requirementsMet = reqStatus.every((r) => r.met);
  const canAfford = M(state.balance).gte(recipe.investmentCost);
  return { requirementsMet, canAfford, reqStatus };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heading: { ...typography.hero, color: palette.textPrimary },
  subheading: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  activeBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: palette.successSoft, borderRadius: radius.md },
  activeBannerText: { ...typography.caption, color: palette.success, fontWeight: '600' },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  card: { backgroundColor: palette.surface, borderRadius: radius.xl, ...shadow.card, overflow: 'hidden' },
  cardDone: { borderWidth: 1.5, borderColor: palette.success + '66' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  cardEmoji: { fontSize: 36 },
  cardName: { ...typography.title, color: palette.textPrimary },
  cardDesc: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, backgroundColor: palette.successSoft, borderRadius: radius.pill },
  doneBadgeText: { ...typography.micro, color: palette.success, fontWeight: '700' },
  bonusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: spacing.lg, marginBottom: spacing.lg, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FEF3C7', borderRadius: radius.pill, alignSelf: 'flex-start' },
  bonusPillDone: { backgroundColor: palette.successSoft },
  bonusText: { ...typography.caption, color: '#B45309', fontWeight: '700' },
  bonusTextDone: { color: palette.success },
  expandedBody: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  reqTitle: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '700', marginBottom: spacing.xs },
  reqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  reqLabel: { ...typography.bodyMedium, color: palette.textTertiary },
  reqLabelMet: { color: palette.textPrimary },
  reqCurrent: { ...typography.micro, color: palette.textTertiary, marginTop: 2 },
  divider: { height: 1, backgroundColor: palette.surfaceAlt },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costLabel: { ...typography.bodyMedium, color: palette.textSecondary },
  costValue: { ...typography.title, fontWeight: '700' },
  costAffordable: { color: palette.textPrimary },
  costExpensive: { color: palette.danger },
  mergeBtn: { backgroundColor: palette.primary, borderRadius: radius.pill, padding: spacing.md, alignItems: 'center', marginTop: spacing.xs },
  mergeBtnDisabled: { backgroundColor: palette.surfaceAlt },
  mergeBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  mergeBtnTextDisabled: { color: palette.textTertiary },
});
