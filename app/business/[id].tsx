import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Decimal from 'decimal.js';
import { useGame } from '../../src/store/gameStore';
import { businessTemplate, levelIncomePerCycle, levelIncomePerHour, upgradeCost } from '../../src/game/economy';
import { SECTOR_COLORS, IT_EMPLOYEES, getItEmployeeCounts, getItTotalWagePerHr, getItProjects } from '../../src/content/businesses';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';
import { formatMoney, M } from '../../src/lib/money';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Sparkline } from '../../src/components/Sparkline';
import { NameBusinessSheet } from '../../src/components/NameBusinessSheet';
import { ProjectPanel } from '../../src/components/ProjectPanel';
import { getProjectsForBusiness } from '../../src/content/projects';

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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.textSecondary }}>Business not owned.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (template.businessType === 'it_company') {
    return (
      <ItCompanyDetail
        id={id}
        owned={owned}
        template={template}
        balance={balance}
        renameOpen={renameOpen}
        setRenameOpen={setRenameOpen}
        upgrade={upgrade}
        hire={hire}
        collect={collect}
        rename={rename}
      />
    );
  }

  const sectorColor = SECTOR_COLORS[template.sector] ?? palette.primary;
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

        {getProjectsForBusiness(template.id).length > 0 ? (
          <Card style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
            <ProjectPanel businessId={template.id} />
          </Card>
        ) : null}

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

// ─── IT Company special screen ────────────────────────────────────────────────

function ItCompanyDetail({
  id, owned, template, balance, renameOpen, setRenameOpen, upgrade, hire, collect, rename,
}: {
  id: string;
  owned: any;
  template: any;
  balance: any;
  renameOpen: boolean;
  setRenameOpen: (v: boolean) => void;
  upgrade: any;
  hire: any;
  collect: any;
  rename: any;
}) {
  const level = owned.level;
  const empCounts = useMemo(() => getItEmployeeCounts(level), [level]);
  const totalWage = useMemo(() => getItTotalWagePerHr(level), [level]);
  const projects = useMemo(() => getItProjects(level), [level]);
  const incomePerHour = levelIncomePerHour(template, level);
  const pendingEarnings = incomePerHour.div(3600).times(Math.max(0, (Date.now() - owned.lastCollectedAt) / 1000));
  const totalStaff = Object.values(empCounts).reduce((a, b) => a + b, 0);
  const officeCapacity = Math.max(5, Math.ceil(totalStaff / 5) * 5);
  const completedProjects = Math.max(0, Math.floor(level / 8));
  const activeProjects = level > 0 ? 1 : 0;

  // Next employee type and hire cost
  const nextEmpType = IT_EMPLOYEES.find((e) => level >= e.levelStart - 1 && level < e.levelEnd);
  const hireCost = upgradeCost(template, level, 1);
  const canHire = balance.gte(hireCost) && level < template.maxLevel;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header gradient */}
        <LinearGradient colors={['#4C1D95', '#7C3AED']} style={styles.itHeader}>
          <Pressable onPress={() => router.back()} style={styles.itBackBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.itHeaderCenter}>
            <View style={styles.itIconBox}>
              <Ionicons name="desktop-outline" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.itCompanyName}>{owned.customName || template.name}</Text>
          </View>
          <Pressable onPress={() => setRenameOpen(true)} style={styles.itBackBtn}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </LinearGradient>

        {/* Summary card */}
        <View style={styles.itSummaryCard}>
          <View style={styles.itSummaryCol}>
            <Text style={styles.itSummaryValue}>{formatMoney(pendingEarnings)}</Text>
            <Text style={styles.itSummaryLabel}>Pending</Text>
          </View>
          <View style={styles.itSummaryDivider} />
          <View style={styles.itSummaryCol}>
            <Text style={styles.itSummaryValue}>{formatMoney(totalWage)}</Text>
            <Text style={styles.itSummaryLabel}>Wage costs per hour</Text>
          </View>
        </View>

        <View style={styles.itBody}>
          {/* Projects */}
          <Text style={styles.itSectionTitle}>Projects</Text>
          <View style={styles.itProjectRow}>
            <View style={styles.itProjectCard}>
              <View style={styles.itProjectIcon}>
                <Ionicons name="time-outline" size={24} color="#7C3AED" />
              </View>
              <Text style={styles.itProjectCount}>{activeProjects}</Text>
              <Text style={styles.itProjectValue}>{formatMoney(incomePerHour)}</Text>
              <Text style={styles.itProjectLabel}>In progress</Text>
            </View>
            <View style={styles.itProjectCard}>
              <View style={[styles.itProjectIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color={palette.success} />
              </View>
              <Text style={styles.itProjectCount}>{completedProjects}</Text>
              <Text style={styles.itProjectValue}>{formatMoney(owned.totalEarned)}</Text>
              <Text style={styles.itProjectLabel}>Complete</Text>
            </View>
          </View>

          {level > 0 && (
            <View style={{ marginHorizontal: -spacing.lg }}>
              <ProjectPanel businessId={id} />
            </View>
          )}

          {!owned.hasManager && level > 0 && (
            <Pressable style={styles.itStartBtn} onPress={() => collect(id, Date.now())}>
              <Text style={styles.itStartBtnText}>Collect earnings</Text>
            </Pressable>
          )}

          {/* Employees */}
          <Text style={styles.itSectionTitle}>Employees</Text>
          <View style={styles.itEmployeeList}>
            {IT_EMPLOYEES.map((emp) => {
              const count = empCounts[emp.type] ?? 0;
              const isNextType = emp === nextEmpType || (level >= emp.levelStart && level <= emp.levelEnd);
              return (
                <View key={emp.type} style={styles.itEmployeeRow}>
                  <View style={[styles.itEmpIcon, { backgroundColor: emp.color + '22' }]}>
                    <Ionicons name={emp.icon} size={22} color={emp.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itEmpLabel}>{emp.label}</Text>
                    <Text style={styles.itEmpWage}>${emp.wagePerHr} / hour</Text>
                  </View>
                  <View style={styles.itEmpCountRow}>
                    <View style={styles.itEmpCountBox}>
                      <Text style={[styles.itEmpCount, count > 0 && { color: emp.color }]}>{count}</Text>
                    </View>
                    {isNextType && (
                      <Pressable
                        style={[styles.itHireBtn, !canHire && styles.itHireBtnDisabled]}
                        onPress={() => {
                          const ok = upgrade(id, 1);
                          if (!ok) Alert.alert("Can't hire", `Need ${formatMoney(hireCost)}.`);
                        }}
                      >
                        <Ionicons name="add" size={18} color={canHire ? '#FFFFFF' : palette.textTertiary} />
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Hire all options */}
          <View style={styles.itHireRow}>
            {([1, 10] as const).map((qty) => {
              const q = Math.min(qty, template.maxLevel - level);
              const cost = q > 0 ? upgradeCost(template, level, q) : new Decimal(0);
              const can = q > 0 && balance.gte(cost);
              return (
                <Pressable
                  key={qty}
                  disabled={!can}
                  onPress={() => upgrade(id, qty)}
                  style={[styles.itHireOption, can ? styles.itHireOptionActive : styles.itHireOptionDisabled]}
                >
                  <Text style={[styles.itHireOptionLabel, can ? styles.itHireOptionLabelActive : styles.itHireOptionLabelDisabled]}>
                    Hire ×{qty}
                  </Text>
                  <Text style={[styles.itHireOptionCost, can ? styles.itHireOptionCostActive : styles.itHireOptionCostDisabled]}>
                    {cost.gt(0) ? formatMoney(cost) : '—'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Manager */}
          <Text style={styles.itSectionTitle}>Office</Text>
          <View style={styles.itOfficeCard}>
            <View style={styles.itOfficeRow}>
              <View style={styles.itOfficeIcon}>
                <Ionicons name="people-outline" size={22} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itOfficeLabel}>Staff members</Text>
                <View style={styles.itOfficeBarTrack}>
                  <View style={[styles.itOfficeBarFill, { width: `${Math.min((totalStaff / officeCapacity) * 100, 100)}%` }]} />
                </View>
              </View>
              <Text style={styles.itOfficeCount}>{totalStaff}/{officeCapacity}</Text>
            </View>
          </View>

          {!owned.hasManager ? (
            <Pressable
              style={[styles.itManagerBtn, balance.lt(template.managerCost) && styles.itManagerBtnDisabled]}
              onPress={() => {
                const ok = hire(id);
                if (!ok) Alert.alert("Can't hire", `Manager costs ${formatMoney(template.managerCost)}.`);
              }}
            >
              <Ionicons name="person-add-outline" size={18} color={balance.gte(template.managerCost) ? '#FFFFFF' : palette.textTertiary} />
              <View>
                <Text style={[styles.itManagerBtnText, balance.lt(template.managerCost) && styles.itManagerBtnTextDisabled]}>
                  Hire HR Manager (auto-collect)
                </Text>
                <Text style={[styles.itManagerBtnCost, balance.lt(template.managerCost) && styles.itManagerBtnTextDisabled]}>
                  {formatMoney(template.managerCost)}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.itManagerActive}>
              <Ionicons name="checkmark-circle" size={20} color={palette.success} />
              <Text style={styles.itManagerActiveText}>HR Manager hired — auto-collecting</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <NameBusinessSheet
        visible={renameOpen}
        template={template}
        mode="rename"
        initialName={owned.customName ?? ''}
        onCancel={() => setRenameOpen(false)}
        onConfirm={(name) => { rename(id, name); setRenameOpen(false); }}
      />
    </SafeAreaView>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

  // ── Standard business ──────────────────────────────────────────────────────
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

  // ── IT Company ─────────────────────────────────────────────────────────────
  itHeader: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  itBackBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  itHeaderCenter: { flex: 1, alignItems: 'center', gap: spacing.sm },
  itIconBox: { width: 60, height: 60, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  itCompanyName: { ...typography.title, color: '#FFFFFF', fontWeight: '700' },
  itSummaryCard: { marginHorizontal: spacing.lg, marginTop: -20, backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', ...shadow.card, zIndex: 10 },
  itSummaryCol: { flex: 1, alignItems: 'center', gap: 4 },
  itSummaryDivider: { width: 1, backgroundColor: palette.surfaceAlt },
  itSummaryValue: { ...typography.headline, color: palette.textPrimary },
  itSummaryLabel: { ...typography.caption, color: palette.textSecondary },
  itBody: { padding: spacing.lg, gap: spacing.lg },
  itSectionTitle: { ...typography.headline, color: palette.textPrimary },
  itSubtitle: { ...typography.caption, color: palette.textSecondary, marginBottom: spacing.sm },
  itProjectRow: { flexDirection: 'row', gap: spacing.md },
  itProjectCard: { flex: 1, backgroundColor: palette.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'flex-start', gap: 2, ...shadow.card },
  itProjectIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  itProjectCount: { ...typography.hero, color: palette.textPrimary },
  itProjectValue: { ...typography.caption, color: palette.textSecondary },
  itProjectLabel: { ...typography.micro, color: palette.textTertiary, marginTop: 4 },
  itProjectList: { backgroundColor: palette.surface, borderRadius: radius.lg, padding: spacing.md, ...shadow.card, gap: spacing.sm },
  itProjectListRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itProjectDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED' },
  itProjectName: { flex: 1, ...typography.bodyMedium, color: palette.textPrimary },
  itProjectPay: { ...typography.bodyMedium, color: palette.success, fontWeight: '700' },
  itStartBtn: { backgroundColor: '#7C3AED', borderRadius: radius.pill, padding: spacing.md, alignItems: 'center' },
  itStartBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  itEmployeeList: { backgroundColor: palette.surface, borderRadius: radius.xl, overflow: 'hidden', ...shadow.card },
  itEmployeeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.surfaceAlt },
  itEmpIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  itEmpLabel: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '600' },
  itEmpWage: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  itEmpCountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itEmpCountBox: { width: 36, alignItems: 'center' },
  itEmpCount: { ...typography.headline, color: palette.textTertiary, fontWeight: '700' },
  itHireBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  itHireBtnDisabled: { backgroundColor: palette.surfaceAlt },
  itHireRow: { flexDirection: 'row', gap: spacing.md },
  itHireOption: { flex: 1, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', gap: 2 },
  itHireOptionActive: { backgroundColor: '#EDE9FE' },
  itHireOptionDisabled: { backgroundColor: palette.surfaceAlt },
  itHireOptionLabel: { ...typography.bodyMedium, fontWeight: '700' },
  itHireOptionLabelActive: { color: '#7C3AED' },
  itHireOptionLabelDisabled: { color: palette.textTertiary },
  itHireOptionCost: { ...typography.caption },
  itHireOptionCostActive: { color: '#7C3AED' },
  itHireOptionCostDisabled: { color: palette.textTertiary },
  itOfficeCard: { backgroundColor: palette.surface, borderRadius: radius.lg, padding: spacing.md, ...shadow.card },
  itOfficeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itOfficeIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  itOfficeLabel: { ...typography.bodyMedium, color: palette.textPrimary, marginBottom: 6 },
  itOfficeBarTrack: { height: 6, borderRadius: 3, backgroundColor: palette.surfaceAlt, overflow: 'hidden' },
  itOfficeBarFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 3 },
  itOfficeCount: { ...typography.title, color: palette.textPrimary, fontWeight: '700' },
  itManagerBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#7C3AED', borderRadius: radius.lg, padding: spacing.md },
  itManagerBtnDisabled: { backgroundColor: palette.surfaceAlt },
  itManagerBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  itManagerBtnTextDisabled: { color: palette.textTertiary },
  itManagerBtnCost: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  itManagerActive: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: palette.successSoft, borderRadius: radius.lg, padding: spacing.md },
  itManagerActiveText: { ...typography.bodyMedium, color: palette.success },
});
