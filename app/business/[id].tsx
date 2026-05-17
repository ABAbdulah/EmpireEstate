import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Decimal from 'decimal.js';
import { useGame } from '../../src/store/gameStore';
import { businessTemplate, levelIncomePerCycle, levelIncomePerHour, upgradeCost } from '../../src/game/economy';
import { SECTOR_COLORS } from '../../src/content/businesses';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { formatMoney, M } from '../../src/lib/money';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Sparkline } from '../../src/components/Sparkline';
import { NameBusinessSheet } from '../../src/components/NameBusinessSheet';

const QTY_OPTIONS: Array<{ label: string; qty: number | 'max' }> = [
  { label: '×1', qty: 1 },
  { label: '×10', qty: 10 },
  { label: '×100', qty: 100 },
  { label: 'Max', qty: 'max' },
];

export default function BusinessDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useGame((s) => s.state);
  const upgrade = useGame((s) => s.upgradeBusiness);
  const hire = useGame((s) => s.hireManager);
  const collect = useGame((s) => s.collectBusiness);
  const addBoost = useGame((s) => s.addBoost);
  const rename = useGame((s) => s.renameBusiness);
  const [renameOpen, setRenameOpen] = useState(false);

  const template = useMemo(() => businessTemplate(id), [id]);
  const owned = state.businesses[id];
  const balance = M(state.balance);

  if (!owned) {
    return (
      <SafeAreaView style={styles.root}>
        <Text>Business not owned.</Text>
      </SafeAreaView>
    );
  }

  const sectorColor = SECTOR_COLORS[template.sector];
  const cycleReward = levelIncomePerCycle(template, owned.level);
  const incomePerHour = levelIncomePerHour(template, owned.level);
  const fakeChart = useMemo(() => {
    const pts: number[] = [];
    let v = 1;
    for (let i = 0; i < 24; i++) {
      v *= 1 + (Math.sin(i / 3 + owned.level) * 0.05 + 0.01);
      pts.push(v);
    }
    return pts;
  }, [owned.level]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{owned.customName || template.name}</Text>
          <Pressable onPress={() => setRenameOpen(true)} style={styles.backBtn}>
            <Ionicons name="create-outline" size={20} color={palette.textPrimary} />
          </Pressable>
        </View>

        <View style={[styles.hero, { backgroundColor: sectorColor + '14' }]}>
          <View style={[styles.iconBox, { backgroundColor: sectorColor }]}>
            <Ionicons name={template.icon} size={42} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroSector}>{template.name.toUpperCase()} · {template.sector.toUpperCase()}</Text>
            <Text style={styles.heroLevel}>Level {owned.level}</Text>
            <Text style={styles.heroIncome}>{formatMoney(incomePerHour)}/hr</Text>
          </View>
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Income (last 24h)</Text>
          <Sparkline data={fakeChart} width={320} height={80} color={sectorColor} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Upgrade</Text>
          <View style={styles.qtyRow}>
            {QTY_OPTIONS.map((opt) => {
              const qty = opt.qty === 'max' ? maxQty(template, owned.level, balance) : Math.min(opt.qty, template.maxLevel - owned.level);
              const cost = qty > 0 ? upgradeCost(template, owned.level, qty) : new Decimal(0);
              const can = qty > 0 && balance.gte(cost);
              return (
                <Pressable
                  key={opt.label}
                  disabled={!can}
                  onPress={() => upgrade(template.id, opt.qty)}
                  style={[styles.qtyBtn, can ? styles.qtyBtnActive : styles.qtyBtnDisabled]}
                >
                  <Text style={[styles.qtyLabel, can ? styles.qtyLabelActive : styles.qtyLabelDisabled]}>{opt.label}{opt.qty === 'max' ? ` (${qty})` : ''}</Text>
                  <Text style={[styles.qtyCost, can ? styles.qtyCostActive : styles.qtyCostDisabled]}>{cost.gt(0) ? formatMoney(cost) : '—'}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Manager</Text>
          {owned.hasManager ? (
            <View style={styles.managerActiveRow}>
              <View style={styles.managerActiveIcon}>
                <Ionicons name="checkmark-circle" size={24} color={palette.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.managerActiveTitle}>Auto-collect active</Text>
                <Text style={styles.managerActiveSubtitle}>Income is collected automatically.</Text>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.managerHelp}>Hire a manager to auto-collect this business while you focus on others or stay offline.</Text>
              <Button
                label={`Hire — ${formatMoney(template.managerCost)}`}
                disabled={balance.lt(template.managerCost)}
                onPress={() => {
                  const ok = hire(template.id);
                  if (!ok) Alert.alert("Can't afford", `Manager costs ${formatMoney(template.managerCost)}.`);
                }}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Boosts</Text>
          <View style={{ gap: spacing.sm }}>
            <Pressable
              onPress={() => addBoost({ id: 'business_30', multiplier: 1.3, endsAt: Date.now() + 4 * 3600_000 })}
              style={styles.boostRow}
            >
              <View style={styles.boostIcon}><Ionicons name="play" size={14} color="#FFFFFF" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.boostTitle}>+30% income for 4 hours</Text>
                <Text style={styles.boostSubtitle}>Free — watch a short ad</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
            </Pressable>
            <Pressable
              onPress={() => addBoost({ id: 'business_100', multiplier: 2, endsAt: Date.now() + 24 * 3600_000 })}
              style={styles.boostRow}
            >
              <View style={[styles.boostIcon, { backgroundColor: palette.premium }]}><Ionicons name="star" size={14} color="#FFFFFF" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.boostTitle}>+100% income for 24 hours</Text>
                <Text style={styles.boostSubtitle}>Premium</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
            </Pressable>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Stats</Text>
          <Stat label="Per cycle" value={`${formatMoney(cycleReward)} / ${template.cycleSeconds}s`} />
          <Stat label="Total earned" value={formatMoney(owned.totalEarned)} />
          <Stat label="Max level" value={template.maxLevel.toString()} />
        </Card>

        {!owned.hasManager ? (
          <Button label={`Collect ${formatMoney(cycleReward)}`} onPress={() => collect(template.id, Date.now())} />
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
      <NameBusinessSheet
        visible={renameOpen}
        template={template}
        mode="rename"
        initialName={owned.customName ?? ''}
        onCancel={() => setRenameOpen(false)}
        onConfirm={(name) => { rename(template.id, name); setRenameOpen(false); }}
      />
    </SafeAreaView>
  );
}

function maxQty(template: ReturnType<typeof businessTemplate>, currentLevel: number, balance: Decimal): number {
  const r = new Decimal('1.07');
  const base = new Decimal(template.baseCost);
  const currCost = base.times(r.pow(currentLevel));
  if (currCost.gt(balance)) return 0;
  const num = balance.times(r.minus(1)).div(currCost).plus(1);
  const log = Decimal.ln(num).div(Decimal.ln(r));
  const n = Math.floor(log.toNumber());
  return Math.max(0, Math.min(n, template.maxLevel - currentLevel));
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: palette.surface, ...shadow.card },
  headerTitle: { ...typography.title, color: palette.textPrimary },
  hero: { flexDirection: 'row', gap: spacing.lg, padding: spacing.lg, borderRadius: radius.xl, alignItems: 'center' },
  iconBox: { width: 70, height: 70, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  heroSector: { ...typography.micro, color: palette.textTertiary, letterSpacing: 1.5 },
  heroLevel: { ...typography.headline, color: palette.textPrimary },
  heroIncome: { ...typography.bodyMedium, color: palette.success, marginTop: 2 },
  chartCard: {},
  chartTitle: { ...typography.caption, color: palette.textSecondary, marginBottom: spacing.sm },
  sectionTitle: { ...typography.title, color: palette.textPrimary, marginBottom: spacing.md },
  qtyRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  qtyBtn: { flex: 1, minWidth: 70, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.md, alignItems: 'center' },
  qtyBtnActive: { backgroundColor: palette.primarySoft },
  qtyBtnDisabled: { backgroundColor: palette.surfaceAlt },
  qtyLabel: { ...typography.bodyMedium },
  qtyLabelActive: { color: palette.primary, fontWeight: '700' },
  qtyLabelDisabled: { color: palette.textTertiary },
  qtyCost: { ...typography.micro, marginTop: 2 },
  qtyCostActive: { color: palette.primary },
  qtyCostDisabled: { color: palette.textTertiary },
  managerActiveRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  managerActiveIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.successSoft, alignItems: 'center', justifyContent: 'center' },
  managerActiveTitle: { ...typography.bodyMedium, color: palette.textPrimary },
  managerActiveSubtitle: { ...typography.caption, color: palette.textSecondary },
  managerHelp: { ...typography.body, color: palette.textSecondary },
  boostRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: palette.surfaceAlt },
  boostIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  boostTitle: { ...typography.bodyMedium, color: palette.textPrimary },
  boostSubtitle: { ...typography.caption, color: palette.textSecondary },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: palette.surfaceAlt },
  statLabel: { ...typography.body, color: palette.textSecondary },
  statValue: { ...typography.bodyMedium, color: palette.textPrimary },
});
