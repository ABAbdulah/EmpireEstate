import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, shadow, spacing, typography } from '../theme';
import { ConditionBar } from './ConditionBar';
import { formatMoney } from '../lib/money';
import { getCarImage } from '../content/carImages';

interface Props {
  visible: boolean;
  carId: string;
  name: string;
  emoji: string;
  segment: 'mass' | 'luxury' | 'premium';
  condition: number;
  askPrice: number | string;
  canAfford: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function BuyCarModal({
  visible, carId, name, emoji, segment, condition, askPrice, canAfford, onCancel, onConfirm,
}: Props) {
  const localImg = getCarImage(carId);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.heroBox}>
            {localImg ? (
              <Image source={localImg} style={styles.hero} resizeMode="contain" />
            ) : (
              <Text style={{ fontSize: 72 }}>{emoji}</Text>
            )}
          </View>

          <Text style={styles.name}>{name}</Text>
          <View style={[styles.segmentPill, segmentStyle(segment)]}>
            <Text style={[styles.segmentText, segmentTextStyle(segment)]}>{segment.toUpperCase()}</Text>
          </View>

          <View style={styles.barWrap}>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Condition</Text>
              <Text style={styles.barPct}>{Math.round(condition * 100)}%</Text>
            </View>
            <ConditionBar value={condition} height={10} />
            <View style={styles.barLegend}>
              <Text style={styles.legendText}>Poor</Text>
              <Text style={styles.legendText}>Fair</Text>
              <Text style={styles.legendText}>Good</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Asking price</Text>
            <Text style={[styles.priceValue, !canAfford && styles.priceValueRed]}>
              {formatMoney(askPrice)}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, !canAfford && styles.confirmBtnDisabled]}
              onPress={canAfford ? onConfirm : undefined}
              disabled={!canAfford}
            >
              <Ionicons name={canAfford ? 'cart' : 'lock-closed'} size={16} color="#FFFFFF" />
              <Text style={styles.confirmText}>{canAfford ? 'Buy now' : 'Cannot afford'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function segmentStyle(s: string) {
  if (s === 'premium') return { backgroundColor: '#FEF3C7' };
  if (s === 'luxury')  return { backgroundColor: '#E0E7FF' };
  return { backgroundColor: '#F1F5F9' };
}

function segmentTextStyle(s: string) {
  if (s === 'premium') return { color: '#92400E' };
  if (s === 'luxury')  return { color: '#3730A3' };
  return { color: '#475569' };
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 420, backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md, ...shadow.floating },
  heroBox: { height: 160, backgroundColor: '#FFFFFF', borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  hero: { width: '100%', height: '100%' },
  name: { ...typography.headline, color: palette.textPrimary, textAlign: 'center' },
  segmentPill: { alignSelf: 'center', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, marginTop: -8 },
  segmentText: { ...typography.micro, fontWeight: '800', letterSpacing: 1 },
  barWrap: { gap: 6 },
  barRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { ...typography.bodyMedium, color: palette.textSecondary, fontWeight: '600' },
  barPct: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '700' },
  barLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  legendText: { ...typography.micro, color: palette.textTertiary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: palette.surfaceAlt },
  priceLabel: { ...typography.bodyMedium, color: palette.textSecondary },
  priceValue: { ...typography.title, color: palette.textPrimary, fontWeight: '700' },
  priceValueRed: { color: palette.danger },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, backgroundColor: palette.surfaceAlt, borderRadius: radius.pill, alignItems: 'center' },
  cancelText: { ...typography.bodyMedium, color: palette.textSecondary, fontWeight: '600' },
  confirmBtn: { flex: 1.4, paddingVertical: spacing.md, backgroundColor: palette.success, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, ...shadow.card },
  confirmBtnDisabled: { backgroundColor: palette.textTertiary },
  confirmText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
});
