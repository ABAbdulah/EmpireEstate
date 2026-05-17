import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomSheet } from './BottomSheet';
import { palette, radius, spacing, typography, shadow } from '../theme';
import { Button } from './Button';
import { useGame } from '../store/gameStore';
import { SHOWROOM_SIZES, SPECIALIZATIONS } from '../content/carBusiness';
import { formatMoney, M } from '../lib/money';

type Step = 'category' | 'showroomType' | 'showroomSize' | 'specialization' | 'name';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Draft {
  category: 'car' | 'quick' | null;
  showroomType: 'used' | 'new' | null;
  showroomSize: 'small' | 'mid' | 'large' | null;
  specialization: 'mass' | 'luxury' | 'premium' | null;
  name: string;
}

const EMPTY: Draft = { category: null, showroomType: null, showroomSize: null, specialization: null, name: '' };

export function StartBusinessSheet({ visible, onClose }: Props) {
  const [step, setStep] = useState<Step>('category');
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const balance = useGame((s) => s.state.balance);
  const create = useGame((s) => s.createCarBusiness);

  const reset = () => { setStep('category'); setDraft(EMPTY); };
  const close = () => { reset(); onClose(); };

  return (
    <BottomSheet visible={visible} onClose={close}>
      {step === 'category' ? (
        <CategoryStep
          onClose={close}
          onPick={(c) => {
            setDraft((d) => ({ ...d, category: c }));
            if (c === 'car') setStep('showroomType');
            else { close(); }
          }}
        />
      ) : null}
      {step === 'showroomType' ? (
        <ShowroomTypeStep
          balance={balance}
          onBack={() => setStep('category')}
          onPick={(t) => { setDraft((d) => ({ ...d, showroomType: t })); setStep('showroomSize'); }}
        />
      ) : null}
      {step === 'showroomSize' && draft.showroomType ? (
        <ShowroomSizeStep
          showroomType={draft.showroomType}
          balance={balance}
          onBack={() => setStep('showroomType')}
          onPick={(s) => { setDraft((d) => ({ ...d, showroomSize: s })); setStep('specialization'); }}
        />
      ) : null}
      {step === 'specialization' ? (
        <SpecializationStep
          onBack={() => setStep('showroomSize')}
          onPick={(s) => { setDraft((d) => ({ ...d, specialization: s })); setStep('name'); }}
        />
      ) : null}
      {step === 'name' && draft.showroomType && draft.showroomSize && draft.specialization ? (
        <NameStep
          name={draft.name}
          onChange={(name) => setDraft((d) => ({ ...d, name }))}
          onBack={() => setStep('specialization')}
          onSubmit={(finalName) => {
            const res = create({
              name: finalName,
              showroomType: draft.showroomType!,
              showroomSize: draft.showroomSize!,
              specialization: draft.specialization!,
            });
            if (!res.ok) {
              Alert.alert("Can't open showroom", res.reason ?? 'Insufficient balance.');
              return;
            }
            close();
            if (res.uid) router.push(`/car-business/${res.uid}` as any);
          }}
        />
      ) : null}
    </BottomSheet>
  );
}

function CategoryStep({ onPick, onClose }: { onPick: (c: 'car' | 'quick') => void; onClose: () => void }) {
  return (
    <View>
      <Text style={styles.heading}>Start a business</Text>
      <Text style={styles.subheading}>Pick a path for your next venture</Text>
      <Pressable style={styles.optionCard} onPress={() => onPick('car')}>
        <View style={[styles.optionIcon, { backgroundColor: '#374151' }]}>
          <Ionicons name="car-sport" size={28} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionTitle}>Car Business</Text>
          <Text style={styles.optionSubtitle}>Open a showroom, stock vehicles, hire a car service, set a specialization</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.textTertiary} />
      </Pressable>
      <Pressable style={[styles.optionCard, styles.optionCardDisabled]} onPress={() => Alert.alert('Tip', 'Quick businesses are in the list on the Business tab — tap any locked card to start it.')}>
        <View style={[styles.optionIcon, { backgroundColor: palette.primary }]}>
          <Ionicons name="business" size={28} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionTitle}>Quick Industry</Text>
          <Text style={styles.optionSubtitle}>Food, transport, tech, finance, entertainment — single-tap launch</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.textTertiary} />
      </Pressable>
      <Pressable style={[styles.optionCard, styles.optionCardDisabled]}>
        <View style={[styles.optionIcon, { backgroundColor: '#9B6FB0' }]}>
          <Ionicons name="restaurant" size={28} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionTitle}>Restaurant Chain</Text>
          <Text style={styles.optionSubtitle}>Coming soon</Text>
        </View>
      </Pressable>
      <View style={{ height: spacing.md }} />
      <Button label="Cancel" variant="ghost" onPress={onClose} />
    </View>
  );
}

function ShowroomTypeStep({ balance, onBack, onPick }: { balance: string; onBack: () => void; onPick: (t: 'used' | 'new') => void }) {
  return (
    <View>
      <StepHeader title="Open a showroom" subtitle="Used cars are cheaper to start — new cars sell for more" onBack={onBack} />
      <Pressable style={styles.optionCard} onPress={() => onPick('used')}>
        <View style={[styles.optionIcon, { backgroundColor: '#5E9D7C' }]}>
          <Ionicons name="time-outline" size={28} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionTitle}>Used car showroom</Text>
          <Text style={styles.optionSubtitle}>From $20k · stock from the used car market</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.textTertiary} />
      </Pressable>
      <Pressable style={styles.optionCard} onPress={() => onPick('new')}>
        <View style={[styles.optionIcon, { backgroundColor: '#2F6BFF' }]}>
          <Ionicons name="sparkles-outline" size={28} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.optionTitle}>New car brand showroom</Text>
          <Text style={styles.optionSubtitle}>From $60k · pristine inventory, higher margins</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.textTertiary} />
      </Pressable>
      <Text style={styles.helper}>Your balance: {formatMoney(balance)}</Text>
    </View>
  );
}

function ShowroomSizeStep({ showroomType, balance, onBack, onPick }: {
  showroomType: 'used' | 'new';
  balance: string;
  onBack: () => void;
  onPick: (s: 'small' | 'mid' | 'large') => void;
}) {
  return (
    <View>
      <StepHeader title={showroomType === 'used' ? 'Used car showroom' : 'New car brand showroom'} subtitle="Pick a starting size — you can expand later" onBack={onBack} />
      {SHOWROOM_SIZES.map((s) => {
        const cost = M(showroomType === 'used' ? s.costUsed : s.costNew);
        const can = M(balance).gte(cost);
        return (
          <Pressable
            key={s.id}
            disabled={!can}
            onPress={() => onPick(s.id)}
            style={[styles.sizeCard, !can && styles.sizeCardDisabled]}
          >
            <View style={styles.sizeIconBox}>
              <Ionicons name={s.id === 'large' ? 'car-sport' : 'car'} size={s.id === 'large' ? 36 : 28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sizeLabel}>{s.label}</Text>
              <Text style={styles.sizeMeta}>{s.capacity} places</Text>
              <Text style={styles.sizeCost}>{formatMoney(cost)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={can ? palette.textPrimary : palette.textTertiary} />
          </Pressable>
        );
      })}
      <Text style={styles.helper}>Your balance: {formatMoney(balance)}</Text>
    </View>
  );
}

function SpecializationStep({ onBack, onPick }: { onBack: () => void; onPick: (s: 'mass' | 'luxury' | 'premium') => void }) {
  return (
    <View>
      <StepHeader title="Specialization" subtitle="What segment will your dealership focus on?" onBack={onBack} />
      {SPECIALIZATIONS.map((s) => (
        <Pressable key={s.id} style={styles.specCard} onPress={() => onPick(s.id)}>
          <Text style={styles.specLabel}>{s.label}</Text>
          <Text style={styles.specExamples}>{s.examples}</Text>
          <View style={styles.specRow}>
            <Ionicons name="cash-outline" size={16} color={palette.textSecondary} />
            <Text style={styles.specPrice}>${Number(s.avgPrice).toLocaleString()}</Text>
            <Text style={styles.specPriceLabel}>average car price</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function NameStep({ name, onChange, onBack, onSubmit }: {
  name: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onSubmit: (finalName: string) => void;
}) {
  return (
    <View>
      <StepHeader title="Name your showroom" subtitle="This name appears on your business and tax records" onBack={onBack} />
      <TextInput
        value={name}
        onChangeText={onChange}
        placeholder="e.g. Brooklyn Auto"
        placeholderTextColor={palette.textTertiary}
        style={styles.input}
        autoFocus
        maxLength={28}
      />
      <View style={{ height: spacing.md }} />
      <Button label="Open showroom" onPress={() => onSubmit(name.trim() || 'My Showroom')} disabled={false} />
    </View>
  );
}

function StepHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  return (
    <View style={styles.stepHeader}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.heading}>{title}</Text>
        {subtitle ? <Text style={styles.subheading}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { ...typography.headline, color: palette.textPrimary },
  subheading: { ...typography.caption, color: palette.textSecondary, marginTop: 2, marginBottom: spacing.md },
  helper: { ...typography.caption, color: palette.textTertiary, marginTop: spacing.md, textAlign: 'center' },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  optionCardDisabled: { opacity: 0.6 },
  optionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '600' },
  optionSubtitle: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  stepHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginBottom: spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: palette.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  sizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#1F2937',
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  sizeCardDisabled: { opacity: 0.45 },
  sizeIconBox: { width: 60, height: 56, justifyContent: 'center', alignItems: 'center' },
  sizeLabel: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '600' },
  sizeMeta: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  sizeCost: { ...typography.headline, color: '#FFFFFF', marginTop: 4 },
  specCard: {
    padding: spacing.lg,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  specLabel: { ...typography.title, color: palette.textPrimary },
  specExamples: { ...typography.caption, color: palette.textSecondary, marginTop: 4 },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  specPrice: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '700' },
  specPriceLabel: { ...typography.caption, color: palette.textSecondary },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    color: palette.textPrimary,
    ...typography.title,
  },
});
