import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, shadow, spacing, typography } from '../theme';
import { BusinessTemplate, SECTOR_COLORS } from '../content/businesses';
import { OwnedBusiness } from '../store/types';
import { formatMoney, M } from '../lib/money';
import { levelIncomePerHour, pendingReward, pendingCycles } from '../game/economy';

interface Props {
  template: BusinessTemplate;
  owned?: OwnedBusiness;
  balance?: string;
  onPress?: () => void;
  onCollect?: () => void;
  onHire?: () => void;
  showBuyAffordance?: boolean;
}

export function BusinessRow({ template, owned, balance, onPress, onCollect, onHire, showBuyAffordance }: Props) {
  const sectorColor = SECTOR_COLORS[template.sector];
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!owned || owned.hasManager) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [owned?.hasManager]);

  if (!owned || owned.level <= 0) {
    const can = balance ? M(balance).gte(template.baseCost) : true;
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed, !can && styles.notAffordable]}>
        <View style={[styles.iconWrap, { backgroundColor: sectorColor + '22' }]}>
          <Ionicons name={template.icon} size={22} color={sectorColor} />
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>{template.name}</Text>
          <Text style={styles.sector}>{template.sector.toUpperCase()}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.priceLabel}>{showBuyAffordance && !can ? 'Locked' : 'Buy'}</Text>
          <Text style={[styles.priceValue, !can && { color: palette.textTertiary }]}>{formatMoney(template.baseCost)}</Text>
        </View>
      </Pressable>
    );
  }

  const now = Date.now();
  const cycles = pendingCycles(template, owned.lastCollectedAt, now);
  const cycleProgressRaw = ((now - owned.lastCollectedAt) / 1000) / template.cycleSeconds;
  const cycleProgress = Math.min(1, cycleProgressRaw - Math.floor(cycleProgressRaw));
  const ready = cycles >= 1;
  const accumulated = pendingReward(template, owned.level, owned.lastCollectedAt, now);
  const incomePerHour = levelIncomePerHour(template, owned.level);
  const canHire = balance && onHire ? M(balance).gte(template.managerCost) : false;
  const displayName = owned.customName || template.name;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: sectorColor + '22' }]}>
        <Ionicons name={template.icon} size={22} color={sectorColor} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        {owned.customName ? (
          <Text style={styles.subName}>{template.name} · Lv {owned.level}</Text>
        ) : (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Lv {owned.level}</Text>
            {owned.hasManager ? (
              <View style={styles.managerChip}>
                <Ionicons name="person" size={10} color={palette.primary} />
                <Text style={styles.managerText}>Auto</Text>
              </View>
            ) : null}
          </View>
        )}
        {owned.customName && owned.hasManager ? (
          <View style={[styles.managerChip, { alignSelf: 'flex-start', marginTop: 4 }]}>
            <Ionicons name="person" size={10} color={palette.primary} />
            <Text style={styles.managerText}>Auto</Text>
          </View>
        ) : null}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${cycleProgress * 100}%`, backgroundColor: sectorColor }]} />
        </View>
        <Text style={styles.hourly}>{formatMoney(incomePerHour)}/hr</Text>
      </View>
      <View style={styles.right}>
        {owned.hasManager ? (
          <View style={styles.autoBadge}>
            <Ionicons name="checkmark-circle" size={14} color={palette.success} />
            <Text style={styles.autoText}>Auto</Text>
          </View>
        ) : ready ? (
          <Pressable
            onPress={(e) => { e.stopPropagation(); onCollect?.(); }}
            style={styles.collectBtn}
          >
            <Text style={styles.collectText}>Collect</Text>
            <Text style={styles.collectAmt}>{formatMoney(accumulated)}</Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={!canHire}
            onPress={(e) => { e.stopPropagation(); onHire?.(); }}
            style={[styles.hireBtn, !canHire && styles.hireBtnDisabled]}
          >
            <Ionicons name="person-add-outline" size={14} color={canHire ? '#FFFFFF' : palette.textTertiary} />
            <Text style={[styles.hireText, !canHire && { color: palette.textTertiary }]}>Hire</Text>
            <Text style={[styles.hireAmt, !canHire && { color: palette.textTertiary }]}>{formatMoney(template.managerCost)}</Text>
          </Pressable>
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
  notAffordable: { opacity: 0.7 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1 },
  name: { ...typography.title, color: palette.textPrimary },
  subName: { ...typography.micro, color: palette.textTertiary, marginTop: 2 },
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
  hourly: { ...typography.micro, color: palette.success, fontWeight: '600', marginTop: 4 },
  right: { alignItems: 'flex-end', minWidth: 96 },
  priceLabel: { ...typography.micro, color: palette.textTertiary },
  priceValue: { ...typography.bodyMedium, color: palette.primary },
  autoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: palette.successSoft, borderRadius: radius.pill },
  autoText: { ...typography.micro, color: palette.success, fontWeight: '700' },
  collectBtn: { backgroundColor: palette.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  collectText: { ...typography.micro, color: '#FFFFFF', fontWeight: '700' },
  collectAmt: { ...typography.caption, color: '#FFFFFF', fontWeight: '700' },
  hireBtn: { flexDirection: 'column', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: palette.primary, borderRadius: radius.pill, gap: 2 },
  hireBtnDisabled: { backgroundColor: palette.surfaceAlt },
  hireText: { ...typography.micro, color: '#FFFFFF', fontWeight: '700' },
  hireAmt: { ...typography.micro, color: '#FFFFFF' },
});
