import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGame } from '../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../src/theme';
import { ConfirmModal } from '../src/components/ConfirmModal';

export default function SettingsScreen() {
  const settings = useGame((s) => s.state.settings);
  const updateSettings = useGame((s) => s.updateSettings);
  const reset = useGame((s) => s.reset);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.heading}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>

          <SettingRow
            icon="volume-high-outline"
            label="Sound effects"
            value={settings.sound}
            onToggle={(v) => updateSettings('sound', v)}
          />
          <SettingRow
            icon="phone-portrait-outline"
            label="Haptic feedback"
            value={settings.haptics}
            onToggle={(v) => updateSettings('haptics', v)}
          />
          <SettingRow
            icon="notifications-outline"
            label="Push notifications"
            value={settings.notifications}
            onToggle={(v) => updateSettings('notifications', v)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATA</Text>
          <Pressable
            style={[styles.settingRow, { borderColor: palette.danger, borderWidth: 1 }]}
            onPress={() => setConfirmReset(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-outline" size={20} color={palette.danger} />
              <View>
                <Text style={[styles.settingLabel, { color: palette.danger }]}>Reset game data</Text>
                <Text style={styles.settingDesc}>Erase all progress and start over</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.danger} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>EmpireState</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDesc}>Build your empire from zero to billions. Buy businesses, invest in stocks & real estate, and prestige your way to infinite wealth.</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={confirmReset}
        title="Reset all game progress?"
        message="This will permanently erase all your businesses, cars, investments, and stats. This cannot be undone."
        icon="trash"
        variant="danger"
        confirmLabel="Yes, reset"
        cancelLabel="Cancel"
        onCancel={() => setConfirmReset(false)}
        onConfirm={async () => {
          setConfirmReset(false);
          await reset();
          router.replace('/');
        }}
      />
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={palette.textSecondary} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: palette.surfaceAlt, true: palette.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heading: { ...typography.hero, color: palette.textPrimary },
  content: { padding: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.xs },
  sectionLabel: { ...typography.micro, color: palette.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, paddingHorizontal: spacing.xs },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, ...shadow.card },
  settingRowLast: {},
  vipRow: { borderColor: '#F59E0B', borderWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  settingLabel: { ...typography.bodyMedium, color: palette.textPrimary },
  settingDesc: { ...typography.caption, color: palette.textSecondary, maxWidth: 220 },
  activePill: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: palette.primarySoft },
  activePillText: { ...typography.caption, color: palette.primary, fontWeight: '600' },
  upgradeBtn: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: palette.primary },
  upgradeBtnText: { ...typography.caption, color: '#FFFFFF', fontWeight: '700' },
  aboutCard: { backgroundColor: palette.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs, ...shadow.card },
  aboutTitle: { ...typography.headline, color: palette.textPrimary },
  aboutVersion: { ...typography.caption, color: palette.textTertiary },
  aboutDesc: { ...typography.bodyMedium, color: palette.textSecondary, marginTop: spacing.sm },
});
