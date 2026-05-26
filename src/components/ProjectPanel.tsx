import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGame } from '../store/gameStore';
import { getProjectsForBusiness, isProjectUnlocked, ProjectDef } from '../content/projects';
import { palette, radius, shadow, spacing, typography } from '../theme';
import { formatMoney, M } from '../lib/money';

interface Props {
  businessId: string;
}

export function ProjectPanel({ businessId }: Props) {
  const state = useGame((s) => s.state);
  const startProject = useGame((s) => s.startProject);
  const collectProject = useGame((s) => s.collectProject);
  const [, setNow] = useState(Date.now());

  // Tick every second so the countdown updates live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const projects = getProjectsForBusiness(businessId);
  const active = state.activeProjects.find((p) => p.businessId === businessId);
  const activeDef = active ? projects.find((p) => p.id === active.projectId) : null;
  const isComplete = active ? Date.now() >= active.completesAt : false;

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Projects</Text>

      {active && activeDef ? (
        <ActiveProjectCard
          project={activeDef}
          completesAt={active.completesAt}
          isComplete={isComplete}
          onCollect={() => {
            const res = collectProject(businessId);
            if (res.ok && res.reward) {
              Alert.alert('Project complete!', `Earned ${formatMoney(res.reward)}.`);
            }
          }}
        />
      ) : null}

      <Text style={styles.subhead}>{active ? 'Other projects' : 'Available projects'}</Text>

      {projects.map((p) => {
        const unlocked = isProjectUnlocked(p, state.projectsCompleted);
        const completedCount = state.projectsCompleted[p.id] ?? 0;
        const canAfford = M(state.balance).gte(p.cost);
        const isActive = active?.projectId === p.id;
        return (
          <ProjectRow
            key={p.id}
            project={p}
            unlocked={unlocked}
            completedCount={completedCount}
            canAfford={canAfford}
            isActive={isActive}
            disabled={!!active && !isActive}
            projectsCompleted={state.projectsCompleted}
            onStart={() => {
              if (!unlocked) {
                Alert.alert('Locked', `Complete the previous tier (${p.unlockAfter} times) to unlock this.`);
                return;
              }
              if (!canAfford) {
                Alert.alert('Insufficient funds', `Need ${formatMoney(p.cost)} to start.`);
                return;
              }
              if (active) {
                Alert.alert('Already running', 'Wait for the current project to finish.');
                return;
              }
              Alert.alert(
                `Start ${p.name}?`,
                `Cost: ${formatMoney(p.cost)}\nDuration: ${formatDuration(p.durationSeconds)}\nReward: ${formatMoney(p.reward)}`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Start',
                    onPress: () => {
                      const res = startProject(businessId, p.id);
                      if (!res.ok) Alert.alert("Can't start", res.reason ?? 'Unknown error');
                    },
                  },
                ]
              );
            }}
          />
        );
      })}
    </View>
  );
}

function ActiveProjectCard({
  project,
  completesAt,
  isComplete,
  onCollect,
}: {
  project: ProjectDef;
  completesAt: number;
  isComplete: boolean;
  onCollect: () => void;
}) {
  const remaining = Math.max(0, completesAt - Date.now());
  const total = project.durationSeconds * 1000;
  const progress = Math.min(1, (total - remaining) / total);
  return (
    <View style={styles.activeCard}>
      <View style={styles.activeRow}>
        <Text style={styles.activeEmoji}>{project.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.activeName}>{project.name}</Text>
          <Text style={styles.activeMeta}>
            {isComplete ? 'Ready to collect!' : `${formatDuration(Math.ceil(remaining / 1000))} remaining`}
          </Text>
        </View>
        <Text style={styles.activeReward}>+{formatMoney(project.reward)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }, isComplete && { backgroundColor: palette.success }]} />
      </View>
      {isComplete ? (
        <Pressable style={styles.collectBtn} onPress={onCollect}>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
          <Text style={styles.collectBtnText}>Collect reward</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ProjectRow({
  project,
  unlocked,
  completedCount,
  canAfford,
  isActive,
  disabled,
  projectsCompleted,
  onStart,
}: {
  project: ProjectDef;
  unlocked: boolean;
  completedCount: number;
  canAfford: boolean;
  isActive: boolean;
  disabled: boolean;
  projectsCompleted: Record<string, number>;
  onStart: () => void;
}) {
  if (isActive) return null;
  const previousCount = unlocked ? 0 : findPreviousTierCount(project, projectsCompleted);
  return (
    <Pressable
      style={[styles.row, (!unlocked || disabled) && styles.rowDisabled]}
      onPress={onStart}
      disabled={disabled}
    >
      <Text style={styles.rowEmoji}>{project.emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTopLine}>
          <Text style={[styles.rowName, !unlocked && styles.rowNameLocked]}>{project.name}</Text>
          {completedCount > 0 ? (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>×{completedCount}</Text>
            </View>
          ) : null}
        </View>
        {unlocked ? (
          <View style={styles.rowMetaLine}>
            <Ionicons name="time-outline" size={11} color={palette.textTertiary} />
            <Text style={styles.rowMeta}>{formatDuration(project.durationSeconds)}</Text>
            <Text style={styles.rowMetaDot}> · </Text>
            <Text style={styles.rowMeta}>Cost {formatMoney(project.cost)}</Text>
          </View>
        ) : (
          <Text style={styles.lockedHint}>
            Complete previous tier {previousCount}/{project.unlockAfter} times
          </Text>
        )}
        {project.staffRequired && unlocked ? (
          <Text style={styles.staffLine}>
            Staff: {Object.entries(project.staffRequired).map(([r, n]) => `${n} ${r.replace('_', ' ')}`).join(', ')}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.rowReward, !canAfford && styles.rowRewardDim]}>+{formatMoney(project.reward)}</Text>
        {!unlocked ? <Ionicons name="lock-closed" size={14} color={palette.textTertiary} /> : null}
      </View>
    </Pressable>
  );
}

function findPreviousTierCount(project: ProjectDef, completedCounts: Record<string, number>): number {
  // Best-effort approximation; ProjectPanel uses projectsCompleted directly via isProjectUnlocked
  // We just need the displayed count of the previous tier project
  const sectorProjects = getProjectsForBusiness(project.businessId);
  const prev = sectorProjects.find((p) => p.tier === project.tier - 1);
  if (!prev) return 0;
  return completedCounts[prev.id] ?? 0;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (remMins === 0) return `${hours}h`;
  return `${hours}h ${remMins}m`;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  heading: { ...typography.title, color: palette.textPrimary },
  subhead: { ...typography.micro, color: palette.textTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.sm },
  activeCard: { padding: spacing.md, backgroundColor: palette.primarySoft, borderRadius: radius.lg, gap: spacing.sm, borderWidth: 1.5, borderColor: palette.primary },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  activeEmoji: { fontSize: 28 },
  activeName: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '700' },
  activeMeta: { ...typography.caption, color: palette.primary, marginTop: 2, fontWeight: '600' },
  activeReward: { ...typography.bodyMedium, color: palette.success, fontWeight: '700' },
  barTrack: { height: 6, backgroundColor: palette.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: palette.primary, borderRadius: 3 },
  collectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: spacing.sm, backgroundColor: palette.success, borderRadius: radius.pill },
  collectBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: palette.surface, borderRadius: radius.md, ...shadow.card },
  rowDisabled: { opacity: 0.55 },
  rowEmoji: { fontSize: 28 },
  rowTopLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowName: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '600' },
  rowNameLocked: { color: palette.textTertiary },
  rowMetaLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rowMeta: { ...typography.micro, color: palette.textSecondary },
  rowMetaDot: { ...typography.micro, color: palette.textTertiary },
  staffLine: { ...typography.micro, color: palette.textTertiary, marginTop: 2 },
  lockedHint: { ...typography.micro, color: palette.textTertiary, marginTop: 2 },
  rowReward: { ...typography.bodyMedium, color: palette.success, fontWeight: '700' },
  rowRewardDim: { color: palette.textTertiary },
  countPill: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: palette.successSoft, borderRadius: radius.pill },
  countPillText: { ...typography.micro, color: palette.success, fontWeight: '700' },
});
