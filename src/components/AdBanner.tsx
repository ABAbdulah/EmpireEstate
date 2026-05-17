import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, radius, spacing, typography } from '../theme';
import { useGame } from '../store/gameStore';

interface Props {
  variant?: 'banner' | 'promo';
}

export function AdBanner({ variant = 'banner' }: Props) {
  const noAds = useGame((s) => s.state.noAds);
  if (noAds) return null;

  if (variant === 'promo') {
    return (
      <LinearGradient
        colors={['#F5B100', '#E07A00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.promo}
      >
        <View style={styles.promoIcon}>
          <Ionicons name="phone-portrait" size={24} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.promoTitle}>NO MORE ADS!</Text>
          <Text style={styles.promoSubtitle}>Disable right now</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
      </LinearGradient>
    );
  }

  return (
    <Pressable style={styles.banner} onPress={() => {}}>
      <View style={styles.adChip}>
        <Text style={styles.adChipText}>Ad</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle} numberOfLines={1}>Get bonus income — try our partner offer</Text>
        <Text style={styles.bannerSubtitle} numberOfLines={1}>Sponsored</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  adChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: palette.textTertiary,
    borderRadius: 4,
  },
  adChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerTitle: { ...typography.caption, color: palette.textPrimary, fontWeight: '600' },
  bannerSubtitle: { ...typography.micro, color: palette.textTertiary },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  promoIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  promoTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.4 },
  promoSubtitle: { color: 'rgba(255,255,255,0.85)', ...typography.caption },
});
