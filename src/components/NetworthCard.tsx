import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Decimal from 'decimal.js';
import { palette, typography, radius, spacing, shadow } from '../theme';
import { MoneyText } from './MoneyText';
import { formatMoney } from '../lib/money';

interface Props {
  networth: Decimal.Value;
  delta?: Decimal.Value;
  deltaLabel?: string;
  title?: string;
  levelTitle?: string;
}

export function NetworthCard({ networth, delta = 0, deltaLabel = 'today', title = 'Fortune', levelTitle }: Props) {
  const d = useMemo(() => new Decimal(delta), [delta]);
  const isPositive = d.gte(0);
  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {levelTitle ? (
          <View style={styles.titleBadge}>
            <Text style={styles.titleBadgeText}>{levelTitle}</Text>
          </View>
        ) : null}
      </View>
      <MoneyText value={networth} style={styles.value} animate />
      <View style={[styles.deltaPill, { backgroundColor: isPositive ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)' }]}>
        <Text style={[styles.deltaText, { color: isPositive ? '#34D399' : '#FCA5A5' }]}>
          {isPositive ? '▲' : '▼'} {formatMoney(d.abs())} {deltaLabel}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xxl,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    ...shadow.floating,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
  },
  titleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(245,177,0,0.15)',
  },
  titleBadgeText: {
    ...typography.caption,
    color: '#F5B100',
  },
  value: {
    ...typography.display,
    color: palette.textInverse,
    marginVertical: spacing.xs,
  },
  deltaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  deltaText: {
    ...typography.caption,
  },
});
