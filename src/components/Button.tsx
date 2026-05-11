import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle, StyleProp, ActivityIndicator } from 'react-native';
import { palette, radius, typography } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md' | 'lg';
}

const VARIANTS: Record<Variant, { bg: ViewStyle; text: TextStyle }> = {
  primary:   { bg: { backgroundColor: palette.primary },     text: { color: '#FFFFFF', fontWeight: '600' } },
  secondary: { bg: { backgroundColor: palette.primarySoft }, text: { color: palette.primary, fontWeight: '600' } },
  ghost:     { bg: { backgroundColor: 'transparent', borderWidth: 1, borderColor: palette.border }, text: { color: palette.textPrimary, fontWeight: '500' } },
  danger:    { bg: { backgroundColor: palette.danger },      text: { color: '#FFFFFF', fontWeight: '600' } },
};

const SIZES: Record<NonNullable<Props['size']>, { padding: ViewStyle; text: TextStyle }> = {
  sm: { padding: { paddingVertical: 8, paddingHorizontal: 16 },  text: { ...typography.caption } },
  md: { padding: { paddingVertical: 12, paddingHorizontal: 20 }, text: { ...typography.bodyMedium } },
  lg: { padding: { paddingVertical: 16, paddingHorizontal: 24 }, text: { ...typography.title } },
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, style, size = 'md' }: Props) {
  const v = VARIANTS[variant];
  const sz = SIZES[size];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        v.bg,
        sz.padding,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.text.color as string} /> :
        <Text style={[styles.label, v.text, sz.text]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  label: { textAlign: 'center' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
});
