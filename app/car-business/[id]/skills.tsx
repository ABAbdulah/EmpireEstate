import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame } from '../../../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../../../src/theme';
import { SKILLS, SkillKey } from '../../../src/content/carBusiness';

export default function SkillsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cb = useGame((s) => s.state.carBusinesses.find((b) => b.uid === id));

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
          const nextLevelRepairs = level * 15;
          return (
            <View key={skill.id} style={[styles.skillBlock, idx % 2 === 1 && { backgroundColor: palette.surfaceAlt }]}>
              <View style={styles.skillHeader}>
                <Ionicons name={skill.icon} size={28} color={palette.textPrimary} />
                <Text style={styles.skillLabel}>{skill.label}</Text>
              </View>
              <SkillStat icon="construct-outline" value={repairs.toString()} label="Number of repairs performed" />
              <SkillStat icon="speedometer-outline" value={`${accuracy}%`} label="Accuracy of condition prediction" />
              <SkillStat icon="bar-chart-outline" value={`${nextLevelRepairs} repairs`} label="Next level" />
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
  skillHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  skillLabel: { ...typography.headline, color: palette.textPrimary },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  statValue: { ...typography.title, color: palette.textPrimary },
  statLabel: { ...typography.caption, color: palette.textSecondary },
});
