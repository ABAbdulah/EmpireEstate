import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Decimal from 'decimal.js';
import { palette, radius, spacing, typography } from '../theme';
import { Button } from './Button';
import { formatDuration } from '../lib/time';
import { formatMoney } from '../lib/money';

interface Props {
  visible: boolean;
  amount: Decimal.Value;
  elapsedMs: number;
  onCollect: () => void;
  onDouble?: () => void;
}

export function OfflineEarningsModal({ visible, amount, elapsedMs, onCollect, onDouble }: Props) {
  const amt = new Decimal(amount);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.scrim}>
        <View style={styles.sheet}>
          <Text style={styles.emoji}>💼</Text>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>While you were away ({formatDuration(elapsedMs)})</Text>
          <View style={styles.amountWrap}>
            <Text style={styles.amount}>{formatMoney(amt)}</Text>
            <Text style={styles.amountLabel}>earned by your businesses</Text>
          </View>
          {onDouble ? (
            <Button label={`Double it — Watch ad`} variant="secondary" onPress={onDouble} style={{ marginBottom: spacing.sm }} />
          ) : null}
          <Button label="Collect" onPress={onCollect} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    width: '100%',
    backgroundColor: palette.surface,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: 'stretch',
  },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: spacing.sm },
  title: { ...typography.hero, color: palette.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.body, color: palette.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  amountWrap: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: palette.successSoft,
  },
  amount: { ...typography.hero, color: palette.success, fontWeight: '700' },
  amountLabel: { ...typography.caption, color: palette.textSecondary, marginTop: 4 },
});
