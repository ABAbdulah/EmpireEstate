import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomPadding } from '../../src/hooks/useBottomPadding';
import { getDayNews, getDayNewsImpact, NewsTemplate, NewsCategory } from '../../src/content/newsTemplates';
import { STOCKS } from '../../src/content/stocks';
import { CRYPTOS } from '../../src/content/stocks';
import { useGame } from '../../src/store/gameStore';
import { palette, radius, shadow, spacing, typography } from '../../src/theme';

// ── Constants ────────────────────────────────────────────────────────────────

const SENTIMENT_COLOR: Record<string, string> = {
  positive: '#10B981',
  negative: '#EF4444',
  neutral: '#6B7280',
};

const FORECAST_COLOR: Record<string, string> = {
  up: '#10B981',
  down: '#EF4444',
  neutral: '#6B7280',
};

const CAT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  All: 'newspaper-outline',
  Stocks: 'trending-up-outline',
  Crypto: 'logo-bitcoin',
  'Real Estate': 'home-outline',
  Business: 'briefcase-outline',
  Economy: 'globe-outline',
};

const CATEGORIES: ('All' | NewsCategory)[] = ['All', 'Stocks', 'Crypto', 'Real Estate', 'Business', 'Economy'];

function formatForecastDate(dayMs: number, forecastDays: number): string {
  const d = new Date(dayMs + forecastDays * 86_400_000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Signal computation ────────────────────────────────────────────────────────

interface Signal {
  ticker: string;
  name: string;
  assetType: 'stock' | 'crypto';
  direction: 'BUY' | 'SELL' | 'HOLD';
  color: string;
  sectorBias: number;
}

function computeDaySignals(day: number): Signal[] {
  const signals: Signal[] = [];

  for (const s of STOCKS) {
    const bias = getDayNewsImpact(s.sector, day);
    const direction: Signal['direction'] = bias > 0.003 ? 'BUY' : bias < -0.003 ? 'SELL' : 'HOLD';
    signals.push({ ticker: s.ticker, name: s.name, assetType: 'stock', direction, color: s.color, sectorBias: bias });
  }

  for (const c of CRYPTOS) {
    const bias = getDayNewsImpact('crypto', day);
    const direction: Signal['direction'] = bias > 0.005 ? 'BUY' : bias < -0.005 ? 'SELL' : 'HOLD';
    signals.push({ ticker: c.symbol, name: c.name, assetType: 'crypto', direction, color: c.color, sectorBias: bias });
  }

  // Sort by absolute bias strength, take top 6
  return signals.sort((a, b) => Math.abs(b.sectorBias) - Math.abs(a.sectorBias)).slice(0, 6);
}

const SIGNAL_DIR_COLOR: Record<string, string> = { BUY: '#10B981', SELL: '#EF4444', HOLD: '#6B7280' };
const SIGNAL_DIR_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  BUY: 'arrow-up-circle',
  SELL: 'arrow-down-circle',
  HOLD: 'pause-circle',
};

// ── Screen ───────────────────────────────────────────────────────────────────

export default function NewsScreen() {
  const bottomPad = useBottomPadding();
  const isVip = useGame((s) => s.state.vip);
  const [activeCategory, setActiveCategory] = useState<'All' | NewsCategory>('All');
  const [signalsUnlocked, setSignalsUnlocked] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { articles, signals, todayMs, day } = useMemo(() => {
    const nowMs = Date.now();
    const d = Math.floor(nowMs / 86_400_000);
    return {
      articles: getDayNews(d),
      signals: computeDaySignals(d),
      todayMs: d * 86_400_000,
      day: d,
    };
  }, []);

  const filtered = useMemo(
    () => (activeCategory === 'All' ? articles : articles.filter((n) => n.category === activeCategory)),
    [activeCategory, articles],
  );

  const signalsVisible = isVip || signalsUnlocked;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <Text style={styles.heading}>Market News</Text>
        <Text style={styles.subheading}>Daily intelligence · news moves prices</Text>
      </View>

      {/* Filter pills — horizontal scroll, each pill is fixed-width */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.filterPill, activeCategory === cat && styles.filterPillActive]}
          >
            <Ionicons
              name={CAT_ICONS[cat]}
              size={13}
              color={activeCategory === cat ? '#FFFFFF' : palette.textSecondary}
            />
            <Text style={[styles.filterText, activeCategory === cat && styles.filterTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>

        {/* ── Market Signals ─────────────────────────────────────────────── */}
        <View style={styles.signalCard}>
          <View style={styles.signalHeader}>
            <View style={styles.signalTitleRow}>
              <Ionicons name="analytics" size={16} color="#F59E0B" />
              <Text style={styles.signalTitle}>Market Signals</Text>
              <View style={styles.signalBadge}>
                <Text style={styles.signalBadgeText}>{isVip ? 'PREMIUM' : 'LOCKED'}</Text>
              </View>
            </View>
            <Text style={styles.signalSubtitle}>AI-generated buy/sell signals from today's news</Text>
          </View>

          {signalsVisible ? (
            <View style={styles.signalList}>
              {signals.map((sig) => (
                <View key={sig.ticker} style={styles.signalRow}>
                  <View style={[styles.signalDot, { backgroundColor: sig.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.signalTicker}>{sig.ticker}</Text>
                    <Text style={styles.signalName} numberOfLines={1}>{sig.name}</Text>
                  </View>
                  <View style={[styles.signalDirChip, { backgroundColor: SIGNAL_DIR_COLOR[sig.direction] + '22' }]}>
                    <Ionicons name={SIGNAL_DIR_ICON[sig.direction]} size={13} color={SIGNAL_DIR_COLOR[sig.direction]} />
                    <Text style={[styles.signalDirText, { color: SIGNAL_DIR_COLOR[sig.direction] }]}>{sig.direction}</Text>
                  </View>
                </View>
              ))}
              <Text style={styles.signalDisclaimer}>Signals are based on news sentiment. Not financial advice.</Text>
            </View>
          ) : (
            <View style={styles.signalLocked}>
              <View style={styles.lockedPreview}>
                {signals.slice(0, 3).map((sig) => (
                  <View key={sig.ticker} style={[styles.signalRow, { opacity: 0.25 }]}>
                    <View style={[styles.signalDot, { backgroundColor: sig.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.signalTicker}>{sig.ticker}</Text>
                      <Text style={styles.signalName}>███████</Text>
                    </View>
                    <View style={[styles.signalDirChip, { backgroundColor: '#F59E0B22' }]}>
                      <Text style={[styles.signalDirText, { color: '#F59E0B' }]}>???</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.lockOverlay}>
                <Ionicons name="lock-closed" size={22} color={palette.textPrimary} />
                <Text style={styles.lockLabel}>Signals locked</Text>
                <Pressable
                  style={styles.watchAdBtn}
                  onPress={() => {
                    Alert.alert('Watch Ad', 'Simulating ad... Signals unlocked for today!', [
                      { text: 'Watch', onPress: () => setSignalsUnlocked(true) },
                      { text: 'Cancel', style: 'cancel' },
                    ]);
                  }}
                >
                  <Ionicons name="play-circle" size={15} color="#FFFFFF" />
                  <Text style={styles.watchAdText}>Watch Ad</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* ── News Articles ──────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={40} color={palette.textTertiary} />
            <Text style={styles.emptyText}>No {activeCategory} stories today</Text>
          </View>
        ) : (
          filtered.map((item, idx) => (
            <ArticleCard
              key={item.id}
              item={item}
              featured={idx === 0}
              todayMs={todayMs}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
            />
          ))
        )}
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({
  item, featured, todayMs, expanded, onToggle,
}: {
  item: NewsTemplate; featured: boolean; todayMs: number; expanded: boolean; onToggle: () => void;
}) {
  const sentColor = SENTIMENT_COLOR[item.sentiment] ?? '#6B7280';
  const fcColor = FORECAST_COLOR[item.forecastDirection] ?? '#6B7280';
  const fcLabel =
    item.forecastDirection === 'up'
      ? 'Market expected to rise'
      : item.forecastDirection === 'down'
      ? 'Market may decline'
      : 'Sideways movement expected';
  const fcDate = formatForecastDate(todayMs, item.forecastDays);

  return (
    <Pressable onPress={onToggle} style={[styles.card, featured && styles.cardFeatured]}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={[styles.catPill, { backgroundColor: sentColor + '22' }]}>
          <Text style={[styles.catText, { color: sentColor }]}>{item.category}</Text>
        </View>
        <View style={[styles.sentimentDot, { backgroundColor: sentColor }]} />
        <Text style={styles.sourceText}>{item.source}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={palette.textTertiary}
        />
      </View>

      <Text style={[styles.headline, featured && styles.headlineFeatured]}>{item.headline}</Text>

      {/* Summary — shown only when expanded */}
      {expanded && <Text style={styles.summary}>{item.summary}</Text>}

      {/* Forecast bar */}
      <View style={[styles.forecastRow, { borderTopColor: fcColor + '33' }]}>
        <Ionicons
          name={item.forecastDirection === 'up' ? 'trending-up' : item.forecastDirection === 'down' ? 'trending-down' : 'swap-horizontal'}
          size={13}
          color={fcColor}
        />
        <Text style={[styles.forecastText, { color: fcColor }]}>{fcLabel}</Text>
        <View style={styles.forecastDatePill}>
          <Ionicons name="calendar-outline" size={11} color={palette.textTertiary} />
          <Text style={styles.forecastDate}>by {fcDate}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
  heading: { ...typography.hero, color: palette.textPrimary },
  subheading: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    flexShrink: 0,
    flexGrow: 0,
  },
  filterPillActive: { backgroundColor: '#1F2937' },
  filterText: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },

  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyText: { ...typography.body, color: palette.textTertiary },

  // ── Signal card ─────────────────────────────────────────────────────────
  signalCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    ...shadow.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F59E0B33',
  },
  signalHeader: { padding: spacing.lg, paddingBottom: spacing.sm },
  signalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  signalTitle: { ...typography.title, color: palette.textPrimary, flex: 1 },
  signalBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#F59E0B22', borderRadius: radius.pill },
  signalBadgeText: { ...typography.micro, color: '#F59E0B', fontWeight: '700' },
  signalSubtitle: { ...typography.caption, color: palette.textSecondary },
  signalList: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm },
  signalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  signalDot: { width: 10, height: 10, borderRadius: 5 },
  signalTicker: { ...typography.bodyMedium, color: palette.textPrimary, fontWeight: '700' },
  signalName: { ...typography.micro, color: palette.textTertiary },
  signalDirChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  signalDirText: { ...typography.caption, fontWeight: '700' },
  signalDisclaimer: { ...typography.micro, color: palette.textTertiary, marginTop: spacing.sm, fontStyle: 'italic' },

  signalLocked: { position: 'relative' },
  lockedPreview: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  lockOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(247,248,250,0.85)',
    paddingVertical: spacing.xl,
    gap: 6,
  },
  lockLabel: { ...typography.title, color: palette.textPrimary },
  watchAdBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
    backgroundColor: palette.primary, borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  watchAdText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },

  // ── Article card ─────────────────────────────────────────────────────────
  card: { backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card, gap: spacing.sm },
  cardFeatured: { borderLeftWidth: 3, borderLeftColor: palette.primary },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  catPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  catText: { ...typography.micro, fontWeight: '700' },
  sentimentDot: { width: 7, height: 7, borderRadius: 4 },
  sourceText: { ...typography.micro, color: palette.textTertiary, fontWeight: '600', flex: 1 },
  headline: { ...typography.title, color: palette.textPrimary },
  headlineFeatured: { ...typography.headline, color: palette.textPrimary },
  summary: { ...typography.body, color: palette.textSecondary },
  forecastRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: spacing.sm, marginTop: spacing.xs,
    borderTopWidth: 1,
  },
  forecastText: { ...typography.micro, fontWeight: '600', flex: 1 },
  forecastDatePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: palette.surfaceAlt, borderRadius: radius.pill,
  },
  forecastDate: { ...typography.micro, color: palette.textTertiary },
});
