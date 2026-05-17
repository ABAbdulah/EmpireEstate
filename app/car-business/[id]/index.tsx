import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame } from '../../../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../../../src/theme';
import { formatMoney, M } from '../../../src/lib/money';
import { SPECIALIZATIONS, SERVICE_SIZES } from '../../../src/content/carBusiness';
import { BottomSheet } from '../../../src/components/BottomSheet';
import { Button } from '../../../src/components/Button';

export default function CarBusinessDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cb = useGame((s) => s.state.carBusinesses.find((b) => b.uid === id));
  const balance = useGame((s) => s.state.balance);
  const collect = useGame((s) => s.collectCarBusiness);
  const buyService = useGame((s) => s.buyCarServiceForBusiness);
  const setSpec = useGame((s) => s.setCarSpecialization);

  const [serviceSheet, setServiceSheet] = useState(false);
  const [specSheet, setSpecSheet] = useState(false);

  if (!cb) {
    return (
      <SafeAreaView style={styles.root}>
        <Pressable onPress={() => router.back()} style={styles.backBtnTop}>
          <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.notFound}>Showroom not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const spec = SPECIALIZATIONS.find((s) => s.id === cb.specialization)!;
  const hourly = M(spec.baseHourlyPerVehicle).times(cb.inventory.length);
  const pending = useMemo(() => {
    const elapsed = (Date.now() - cb.lastCollectedAt) / 1000;
    return M(spec.baseHourlyPerVehicle).times(cb.inventory.length).times(elapsed).div(3600);
  }, [cb.lastCollectedAt, cb.inventory.length, spec]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
          <View style={styles.headerTopRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}>
              <Ionicons name="car-sport" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.headerName}>{cb.name}</Text>
          </View>
        </LinearGradient>

        <View style={styles.pendingCard}>
          <Text style={styles.pendingValue}>{formatMoney(pending)}</Text>
          <Text style={styles.pendingLabel}>Pending</Text>
          <Button label="Collect" onPress={() => collect(cb.uid, Date.now())} style={{ marginTop: spacing.md }} />
        </View>

        {cb.serviceSize ? (
          <View style={styles.serviceCard}>
            <View style={styles.serviceBadge}>
              <Text style={styles.serviceBadgeText}>Car service</Text>
            </View>
            <View style={styles.serviceBody}>
              <View style={styles.serviceCircle}>
                <Text style={styles.serviceCirclePct}>0%</Text>
                <Text style={styles.serviceCircleLabel}>Used</Text>
              </View>
              <View style={{ flex: 1, gap: 12 }}>
                <ServiceStatRow icon="time-outline" label="Pending" value="0" />
                <ServiceStatRow icon="construct-outline" label="In progress" value="0" />
                <ServiceStatRow icon="scan-outline" label="Capacity:" value={cb.serviceCapacity.toString()} />
              </View>
            </View>
          </View>
        ) : null}

        <LinearGradient colors={['#0E7C66', '#0F172A']} style={styles.showroomCard}>
          <Text style={styles.showroomTitle}>Showroom</Text>
          <View style={styles.showroomStatRow}>
            <View style={styles.showroomStat}>
              <Text style={styles.showroomStatValue}>{cb.inventory.length}</Text>
              <Text style={styles.showroomStatLabel}>Vehicles for sale</Text>
            </View>
            <View style={styles.showroomStat}>
              <Text style={styles.showroomStatValue}>{cb.showroomCapacity}</Text>
              <Text style={styles.showroomStatLabel}>Showroom capacity</Text>
            </View>
          </View>
          <View style={styles.showroomTotal}>
            <Ionicons name="receipt-outline" size={20} color="rgba(255,255,255,0.85)" />
            <Text style={styles.showroomTotalValue}>{formatMoney(cb.inventory.reduce((sum, c) => sum + Number(c.askPrice), 0))}</Text>
            <Text style={styles.showroomTotalLabel}>Total cost of vehicles</Text>
          </View>
        </LinearGradient>

        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickTile}
            onPress={() => router.push(`/car-business/${cb.uid}/market` as any)}
          >
            <Ionicons name="car-outline" size={40} color={palette.textSecondary} />
            <Text style={styles.quickTileTitle}>Used car market</Text>
          </Pressable>
          <Pressable style={styles.quickTile} onPress={() => setSpecSheet(true)}>
            <Text style={styles.quickTileTitle}>Specialization</Text>
            <View style={styles.specBarTrack}>
              <View style={[styles.specBarFill, { width: cb.specialization === 'mass' ? '33%' : cb.specialization === 'luxury' ? '66%' : '100%' }]} />
            </View>
            <Text style={styles.quickTileMeta}>{spec.label}</Text>
            <Text style={styles.quickTileSub}>Click to change</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Improvements and investments</Text>
        <View style={styles.quickGrid}>
          <Pressable
            style={styles.quickTileLight}
            onPress={() => setServiceSheet(true)}
          >
            <Ionicons name="construct" size={32} color={palette.textPrimary} />
            <Text style={styles.quickTileTitleDark}>Car service</Text>
            <Text style={styles.quickTileMetaDark}>{cb.serviceSize ? `${cb.serviceCapacity} capacity` : 'Not set up'}</Text>
          </Pressable>
          <Pressable style={styles.quickTileLight}>
            <Ionicons name="storefront" size={32} color={palette.textPrimary} />
            <Text style={styles.quickTileTitleDark}>Showroom</Text>
            <Text style={styles.quickTileMetaDark}>{cb.showroomCapacity} places</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.skillsRow}
          onPress={() => router.push(`/car-business/${cb.uid}/skills` as any)}
        >
          <View style={styles.skillsIcon}>
            <Ionicons name="people-outline" size={26} color={palette.textPrimary} />
          </View>
          <Text style={styles.skillsLabel}>Skills</Text>
          <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
        </Pressable>

        <View style={styles.statsCard}>
          <Stat label="Earnings all time" value={formatMoney(cb.totalEarned)} />
          <Stat label="Income per hour" value={`${formatMoney(hourly)}/hr`} />
          <Stat label="Specialization" value={spec.label} />
          <Stat label="Avg price (segment)" value={formatMoney(spec.avgPrice)} last />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <BottomSheet visible={serviceSheet} onClose={() => setServiceSheet(false)}>
        <Text style={styles.sheetTitle}>Open a car service</Text>
        <Text style={styles.sheetSubtitle}>Service capacity affects how many cars you can repair before resale.</Text>
        {SERVICE_SIZES.map((s) => {
          const cost = M(s.cost);
          const can = M(balance).gte(cost);
          return (
            <Pressable
              key={s.id}
              disabled={!can}
              onPress={() => {
                const ok = buyService(cb.uid, s.id);
                if (!ok) Alert.alert("Can't open", `Need ${formatMoney(cost)} to open ${s.label.toLowerCase()}.`);
                setServiceSheet(false);
              }}
              style={[styles.svcCard, !can && { opacity: 0.5 }]}
            >
              <View style={styles.svcIcon}>
                <Ionicons name="construct" size={28} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.svcLabel}>{s.label}</Text>
                <Text style={styles.svcMeta}>{s.capacity} places</Text>
                <Text style={styles.svcCost}>{formatMoney(cost)}</Text>
              </View>
            </Pressable>
          );
        })}
      </BottomSheet>

      <BottomSheet visible={specSheet} onClose={() => setSpecSheet(false)}>
        <Text style={styles.sheetTitle}>Change specialization</Text>
        <Text style={styles.sheetSubtitle}>This affects which cars appear in your market and your hourly income.</Text>
        {SPECIALIZATIONS.map((s) => {
          const active = s.id === cb.specialization;
          return (
            <Pressable
              key={s.id}
              onPress={() => { setSpec(cb.uid, s.id); setSpecSheet(false); }}
              style={[styles.specChoice, active && { borderColor: palette.primary, borderWidth: 2 }]}
            >
              <Text style={styles.specChoiceLabel}>{s.label}</Text>
              <Text style={styles.specChoiceExamples}>{s.examples}</Text>
              <Text style={styles.specChoicePrice}>${Number(s.avgPrice).toLocaleString()} avg</Text>
            </Pressable>
          );
        })}
      </BottomSheet>
    </SafeAreaView>
  );
}

function Stat({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.statRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function ServiceStatRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.serviceStatRow}>
      <Ionicons name={icon} size={16} color={palette.textSecondary} />
      <Text style={styles.serviceStatLabel}>{label}</Text>
      <Text style={styles.serviceStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { paddingBottom: 32 },
  notFound: { ...typography.title, color: palette.textSecondary },
  backBtnTop: { margin: spacing.lg, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  settingsBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  headerIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' },
  headerName: { ...typography.title, color: '#FFFFFF' },
  pendingCard: { marginHorizontal: spacing.lg, marginTop: -spacing.lg, padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.lg, alignItems: 'center', ...shadow.card },
  pendingValue: { ...typography.hero, color: palette.textPrimary },
  pendingLabel: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  serviceCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg, backgroundColor: palette.surfaceAlt, borderRadius: radius.lg, overflow: 'hidden' },
  serviceBadge: { alignSelf: 'center', marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 6, backgroundColor: '#1F2937', borderRadius: radius.pill },
  serviceBadgeText: { ...typography.bodyMedium, color: '#FFFFFF' },
  serviceBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  serviceCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  serviceCirclePct: { ...typography.headline, color: palette.textPrimary },
  serviceCircleLabel: { ...typography.micro, color: palette.textTertiary },
  serviceStatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceStatLabel: { ...typography.body, color: palette.textSecondary, flex: 1 },
  serviceStatValue: { ...typography.bodyMedium, color: palette.textPrimary },
  showroomCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.xl, gap: spacing.md },
  showroomTitle: { ...typography.headline, color: '#FFFFFF' },
  showroomStatRow: { flexDirection: 'row', gap: spacing.md },
  showroomStat: { flex: 1, padding: spacing.md, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md },
  showroomStatValue: { ...typography.hero, color: '#FFFFFF' },
  showroomStatLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  showroomTotal: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: radius.md },
  showroomTotalValue: { ...typography.title, color: '#FFFFFF' },
  showroomTotalLabel: { ...typography.caption, color: 'rgba(255,255,255,0.6)' },
  quickGrid: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  quickTile: { flex: 1, padding: spacing.lg, backgroundColor: palette.surfaceAlt, borderRadius: radius.lg, minHeight: 140, justifyContent: 'space-between' },
  quickTileLight: { flex: 1, padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.lg, minHeight: 130, alignItems: 'center', gap: spacing.sm, ...shadow.card },
  quickTileTitle: { ...typography.title, color: palette.textPrimary },
  quickTileTitleDark: { ...typography.bodyMedium, color: palette.textPrimary },
  quickTileMeta: { ...typography.caption, color: palette.textPrimary, marginTop: spacing.sm },
  quickTileMetaDark: { ...typography.caption, color: palette.textSecondary },
  quickTileSub: { ...typography.micro, color: palette.textTertiary, marginTop: 4 },
  specBarTrack: { height: 8, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden', marginVertical: spacing.sm },
  specBarFill: { height: '100%', backgroundColor: palette.primary, borderRadius: 4 },
  sectionTitle: { ...typography.headline, color: palette.textPrimary, marginHorizontal: spacing.lg, marginTop: spacing.xl },
  skillsRow: { marginHorizontal: spacing.lg, marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  skillsIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: palette.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  skillsLabel: { ...typography.bodyMedium, color: palette.textPrimary, flex: 1 },
  statsCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.lg, ...shadow.card },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: palette.surfaceAlt },
  statLabel: { ...typography.body, color: palette.textSecondary },
  statValue: { ...typography.bodyMedium, color: palette.textPrimary },
  sheetTitle: { ...typography.headline, color: palette.textPrimary },
  sheetSubtitle: { ...typography.caption, color: palette.textSecondary, marginTop: 4, marginBottom: spacing.md },
  svcCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: '#1F2937', borderRadius: radius.lg, marginBottom: spacing.sm },
  svcIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  svcLabel: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '600' },
  svcMeta: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  svcCost: { ...typography.title, color: '#FFFFFF', marginTop: 4 },
  specChoice: { padding: spacing.md, backgroundColor: palette.surfaceAlt, borderRadius: radius.lg, marginBottom: spacing.sm, borderWidth: 2, borderColor: 'transparent' },
  specChoiceLabel: { ...typography.title, color: palette.textPrimary },
  specChoiceExamples: { ...typography.caption, color: palette.textSecondary, marginTop: 4 },
  specChoicePrice: { ...typography.bodyMedium, color: palette.textPrimary, marginTop: 6, fontWeight: '700' },
});
