import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, shadow, spacing, typography } from '../theme';
import { BusinessTemplate, SECTOR_COLORS } from '../content/businesses';
import { OwnedBusiness } from '../store/types';
import { formatMoney } from '../lib/money';
import { levelIncomePerCycle, levelIncomePerHour } from '../game/economy';
import { formatDuration } from '../lib/time';

interface Props {
  template: BusinessTemplate;
  owned?: OwnedBusiness;
  onPress?: () => void;
  onCollect?: () => void;
}

export function BusinessRow({ template, owned, onPress, onCollect }: Props) {
  const sectorColor = SECTOR_COLORS[template.sector];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!owned || owned.hasManager) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [owned?.hasManager]);

  if (!owned || owned.level <= 0) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed, styles.locked]}>
        <View style={[styles.iconWrap, { backgroundColor: sectorColor + '22' }]}>
          <Ionicons name={template.icon} size={22} color={sectorColor} />
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>{template.name}</Text>
          <Text style={styles.sector}>{template.sector.toUpperCase()}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.priceLabel}>Buy</Text>
          <Text style={styles.priceValue}>{formatMoney(template.baseCost)}</Text>
        </View>
      </Pressable>
    );
  }

  const now = Date.now();
  const elapsed = (now - owned.lastCollectedAt) / 1000;
  const cycleProgress = Math.min(1, elapsed / template.cycleSeconds);
  const incomePerHour = levelIncomePerHour(template, owned.level);
  const cycleReward = levelIncomePerCycle(template, owned.level);
  const ready = cycleProgress >= 1;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: sectorColor + '22' }]}>
        <Ionicons name={template.icon} size={22} color={sectorColor} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{template.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Lv {owned.level}</Text>
          {owned.hasManager ? (
            <View style={styles.managerChip}>
              <Ionicons name="person" size={10} color={palette.primary} />
              <Text style={styles.managerText}>Auto</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${cycleProgress * 100}%`, backgroundColor: sectorColor }]} />
        </View>
      </View>
      <View style={styles.right}>
        {owned.hasManager ? (
          <>
            <Text style={styles.incomeLabel}>per hour</Text>
            <Text style={styles.incomeValue}>{formatMoney(incomePerHour)}</Text>
          </>
        ) : ready ? (
          <Pressable
            onPress={(e) => { e.stopPropagation(); onCollect?.(); }}
            style={styles.collectBtn}
          >
            <Text style={styles.collectText}>Collect</Text>
            <Text style={styles.collectAmt}>{formatMoney(cycleReward)}</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.incomeLabel}>in</Text>
            <Text style={styles.incomeValue}>{formatDuration((1 - cycleProgress) * template.cycleSeconds * 1000)}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.card,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  locked: { opacity: 0.95 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1 },
  name: { ...typography.title, color: palette.textPrimary },
  sector: { ...typography.micro, color: palette.textTertiary, letterSpacing: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  metaText: { ...typography.caption, color: palette.textSecondary },
  managerChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: palette.primarySoft },
  managerText: { ...typography.micro, color: palette.primary, fontWeight: '600' },
  progressTrack: {
    marginTop: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  right: { alignItems: 'flex-end', minWidth: 88 },
  priceLabel: { ...typography.micro, color: palette.textTertiary },
  priceValue: { ...typography.bodyMedium, color: palette.primary },
  incomeLabel: { ...typography.micro, color: palette.textTertiary },
  incomeValue: { ...typography.bodyMedium, color: palette.textPrimary },
  collectBtn: { backgroundColor: palette.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  collectText: { ...typography.micro, color: '#FFFFFF', fontWeight: '700' },
  collectAmt: { ...typography.caption, color: '#FFFFFF', fontWeight: '700' },
});
