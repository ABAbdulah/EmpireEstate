import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { showAlert } from '../../../src/components/GlobalModal';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame } from '../../../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../../../src/theme';
import { SKILLS, SkillKey } from '../../../src/content/carBusiness';
import { formatMoney, M } from '../../../src/lib/money';

export default function SkillsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cb = useGame((s) => s.state.carBusinesses.find((b) => b.uid === id));
  const balance = useGame((s) => s.state.balance);
  const upgradeCarSkill = useGame((s) => s.upgradeCarSkill);

  if (!cb) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.heading}>Skills</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        {SKILLS.map((skill, idx) => {
          const k = skill.id as SkillKey;
          const repairs = cb.skillRepairs[k];
          const level = cb.skills[k];
          const accuracy = 60 + Math.min(40, level * 5);
          const maxLevel = 10;
          const atMax = level >= maxLevel;
          const upgradeCost = M('50000').times(level * level);
          const canAfford = M(balance).gte(upgradeCost);
          return (
            <View key={skill.id} style={styles.skillBlock}>
              <View style={styles.skillHeader}>
                <View style={styles.skillIconBox}>
                  <Ionicons name={skill.icon} size={22} color={palette.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.skillLabel}>{skill.label}</Text>
                  <Text style={styles.skillDesc}>{skill.description}</Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Lv {level}</Text>
                </View>
              </View>

              <View style={styles.levelBarTrack}>
                <View style={[styles.levelBarFill, { width: `${(level / maxLevel) * 100}%` }]} />
              </View>

              <SkillStat icon="speedometer-outline" value={`${accuracy}%`} label="Condition prediction accuracy" />
              <SkillStat icon="construct-outline" value={repairs.toString()} label="Repairs performed" />

              <Pressable
                disabled={atMax || !canAfford}
                style={[styles.upgradeBtn, (atMax || !canAfford) && styles.upgradeBtnDisabled]}
                onPress={() => {
                  const ok = upgradeCarSkill(cb.uid, k);
                  if (!ok) showAlert({ title: "Can't upgrade", message: canAfford ? 'Already at max level.' : `You need ${formatMoney(upgradeCost)} to upgrade this skill.`, icon: canAfford ? 'checkmark-circle' : 'cash-outline', variant: canAfford ? 'warning' : 'danger' });
                }}
              >
                <Text style={[styles.upgradeBtnText, (atMax || !canAfford) && styles.upgradeBtnTextDisabled]}>
                  {atMax ? 'Max level' : `Upgrade · ${formatMoney(upgradeCost)}`}
                </Text>
              </Pressable>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SkillStat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={styles.statRow}>
      <Ionicons name={icon} size={18} color={palette.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heading: { ...typography.hero, color: palette.textPrimary },
  skillBlock: { padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.lg, gap: spacing.md, ...shadow.card },
  skillHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  skillIconBox: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  skillLabel: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '700' },
  skillDesc: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  levelBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: palette.primarySoft },
  levelBadgeText: { ...typography.caption, color: palette.primary, fontWeight: '700' },
  levelBarTrack: { height: 6, borderRadius: 3, backgroundColor: palette.surfaceAlt, overflow: 'hidden' },
  levelBarFill: { height: '100%', backgroundColor: palette.primary, borderRadius: 3 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statValue: { ...typography.title, color: palette.textPrimary },
  statLabel: { ...typography.caption, color: palette.textSecondary },
  upgradeBtn: { backgroundColor: palette.primary, borderRadius: radius.pill, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs },
  upgradeBtnDisabled: { backgroundColor: palette.surfaceAlt },
  upgradeBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  upgradeBtnTextDisabled: { color: palette.textTertiary },
});
