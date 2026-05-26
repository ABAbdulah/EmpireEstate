import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { palette, radius, typography } from '../theme';

interface Props {
  /** 0-1 condition value */
  value: number;
  /** Optional label above the bar */
  label?: string;
  /** Height of the bar in pixels (default: 8) */
  height?: number;
  /** Show percent text to the right */
  showPercent?: boolean;
  /** Thresholds for subtle markers (0-1). Default: [0.5, 0.75] */
  markers?: number[];
}

/**
 * Condition bar with subtle threshold markers.
 *
 * Colors:
 *   < 50% → red (poor)
 *   50-75% → amber (fair)
 *   ≥ 75% → green (good)
 *
 * Markers are very faint vertical lines on the track — just a hint to the user
 * about where "fair" and "good" thresholds are.
 */
export function ConditionBar({
  value,
  label,
  height = 8,
  showPercent = false,
  markers = [0.5, 0.75],
}: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  const pct = clamped * 100;
  const fillColor =
    clamped >= 0.75 ? palette.success :
    clamped >= 0.5  ? '#F5B100' :
                      palette.danger;

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <View style={[styles.track, { height, borderRadius: height / 2 }]}>
          <View style={[styles.fill, {
            width: `${pct}%`,
            height,
            borderRadius: height / 2,
            backgroundColor: fillColor,
          }]} />
          {/* Subtle threshold markers — barely visible vertical lines */}
          {markers.map((m, i) => (
            <View
              key={i}
              style={[styles.marker, {
                left: `${m * 100}%`,
                height: height + 2,
                top: -1,
              }]}
            />
          ))}
        </View>
        {showPercent ? (
          <Text style={styles.pct}>{Math.round(pct)}%</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.micro, color: palette.textTertiary, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: {
    flex: 1,
    backgroundColor: palette.surfaceAlt,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: { position: 'absolute', left: 0, top: 0 },
  marker: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },
  pct: { ...typography.micro, color: palette.textSecondary, fontWeight: '700', minWidth: 36, textAlign: 'right' },
});
