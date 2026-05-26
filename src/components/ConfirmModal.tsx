import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, shadow, spacing, typography } from '../theme';

type Variant = 'default' | 'success' | 'danger' | 'warning';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: Variant;
  confirmLabel: string;
  /** Provide a cancel label to render the secondary button. Omit for info-only modals. */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_COLORS: Record<Variant, { bg: string; icon: string }> = {
  default: { bg: palette.primary,   icon: palette.primary },
  success: { bg: palette.success,   icon: palette.success },
  danger:  { bg: palette.danger,    icon: palette.danger },
  warning: { bg: '#F59E0B',         icon: '#F59E0B' },
};

export function ConfirmModal({
  visible,
  title,
  message,
  icon,
  variant = 'default',
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  const showCancel = cancelLabel !== undefined;
  const colors = VARIANT_COLORS[variant];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {icon ? (
            <View style={[styles.iconCircle, { backgroundColor: colors.icon + '22' }]}>
              <Ionicons name={icon} size={32} color={colors.icon} />
            </View>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {showCancel ? (
              <Pressable style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable style={[styles.confirmBtn, { backgroundColor: colors.bg }]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.55)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 400, backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.md, ...shadow.floating },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.headline, color: palette.textPrimary, textAlign: 'center' },
  message: { ...typography.bodyMedium, color: palette.textSecondary, textAlign: 'center', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: spacing.md, backgroundColor: palette.surfaceAlt, borderRadius: radius.pill, alignItems: 'center' },
  cancelText: { ...typography.bodyMedium, color: palette.textSecondary, fontWeight: '600' },
  confirmBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.pill, alignItems: 'center', ...shadow.card },
  confirmText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
});
