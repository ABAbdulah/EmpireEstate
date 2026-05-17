import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { palette, radius, spacing, typography } from '../theme';
import { BusinessTemplate, SECTOR_COLORS } from '../content/businesses';
import { formatMoney } from '../lib/money';

interface Props {
  visible: boolean;
  template: BusinessTemplate | null;
  mode: 'buy' | 'rename';
  initialName?: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export function NameBusinessSheet({ visible, template, mode, initialName = '', onCancel, onConfirm }: Props) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) setName(initialName);
  }, [visible, initialName]);

  if (!template) return null;
  const color = SECTOR_COLORS[template.sector];

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
          <Ionicons name={template.icon} size={26} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{template.sector.toUpperCase()}</Text>
          <Text style={styles.heading}>{mode === 'buy' ? `Name your ${template.name}` : 'Rename'}</Text>
        </View>
      </View>
      <Text style={styles.subheading}>
        {mode === 'buy'
          ? `This name shows in your business list — give it something memorable.`
          : `The display name shown in your business list.`}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={`e.g. ${defaultPlaceholder(template.id)}`}
        placeholderTextColor={palette.textTertiary}
        style={styles.input}
        autoFocus
        maxLength={30}
        returnKeyType="done"
        onSubmitEditing={() => onConfirm(name)}
      />
      {mode === 'buy' ? (
        <View style={styles.costRow}>
          <Ionicons name="cash-outline" size={16} color={palette.textSecondary} />
          <Text style={styles.costText}>One-time cost</Text>
          <Text style={styles.costValue}>{formatMoney(template.baseCost)}</Text>
        </View>
      ) : null}
      <View style={{ height: spacing.md }} />
      <Button label={mode === 'buy' ? 'Open business' : 'Save name'} onPress={() => onConfirm(name)} />
      <View style={{ height: spacing.sm }} />
      <Button label="Cancel" variant="ghost" onPress={onCancel} />
    </BottomSheet>
  );
}

function defaultPlaceholder(id: string): string {
  switch (id) {
    case 'lemonade':  return "Brooklyn's Lemonade";
    case 'foodtruck': return 'Wheels of Flavor';
    case 'coffee':    return 'Daily Grind';
    case 'taxi':      return 'Yellow Line Taxi';
    case 'it':        return 'NorthByte Labs';
    case 'factory':   return 'Iron Crest Works';
    case 'cinema':    return 'Starlight Cinemas';
    case 'bank':      return 'Meridian Trust';
    case 'airline':   return 'Skywave Airlines';
    case 'tech-giant':return 'Helios Tech';
    case 'oil':       return 'Pacific Petrolium';
    case 'space':     return 'Orbit Pioneers';
    default:          return 'My Business';
  }
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  kicker: { ...typography.micro, color: palette.textTertiary, letterSpacing: 1.2 },
  heading: { ...typography.headline, color: palette.textPrimary },
  subheading: { ...typography.caption, color: palette.textSecondary, marginBottom: spacing.md },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    color: palette.textPrimary,
    ...typography.title,
  },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  costText: { ...typography.caption, color: palette.textSecondary, flex: 1 },
  costValue: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '700' },
});
