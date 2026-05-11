import React from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import Decimal from 'decimal.js';
import { palette, categoryColors, CategoryKey, typography, radius, shadow, spacing } from '../theme';
import { formatMoney } from '../lib/money';

interface Props {
  category: CategoryKey;
  label: string;
  value: Decimal.Value;
  cta?: string;
  onPress?: () => void;
}

export function AssetCard({ category, label, value, cta, onPress }: Props) {
  const colors = categoryColors[category];
  const v = new Decimal(value);
  const isEmpty = v.isZero();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}>
      <View style={[styles.bar, { backgroundColor: colors.bar }]} />
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        {isEmpty && cta ? (
          <Text style={styles.cta}>{cta} →</Text>
        ) : (
          <Text style={styles.value}>{formatMoney(v)}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 68,
    ...shadow.card,
  },
  bar: {
    width: 6,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: palette.textSecondary,
    marginBottom: 2,
  },
  value: {
    ...typography.title,
    color: palette.textPrimary,
  },
  cta: {
    ...typography.bodyMedium,
    color: palette.primary,
  },
});
