import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Pressable } from 'react-native';
import { showAlert } from '../../../src/components/GlobalModal';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Decimal from 'decimal.js';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useGame } from '../../../src/store/gameStore';
import { getStockSnapshot } from '../../../src/game/market';
import { formatMoney, formatPercent, M } from '../../../src/lib/money';
import { palette, radius, shadow, spacing, typography } from '../../../src/theme';

export default function StockDetailScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const state = useGame((s) => s.state);
  const buy = useGame((s) => s.buyStock);
  const sell = useGame((s) => s.sellStock);
  const bottomPad = 24;

  const snap = useMemo(() => getStockSnapshot(ticker), [ticker]);
  const owned = state.stocks[ticker];
  const balance = M(state.balance);

  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [qty, setQty] = useState('1');

  if (!snap) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <Text style={{ color: palette.textPrimary, padding: spacing.lg }}>Stock not found.</Text>
      </SafeAreaView>
    );
  }

  const qtyNum = Math.max(0, parseInt(qty) || 0);
  const total = M(snap.price).times(qtyNum);
  const canBuy = qtyNum > 0 && balance.gte(total);
  const canSell = qtyNum > 0 && !!owned && owned.quantity >= qtyNum;
  const up = snap.changePct >= 0;

  // Build chart path from the 24-point series
  const W = 320, H = 120;
  const series = snap.series;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const fillPath = `${pts} L${W},${H} L0,${H} Z`;
  const lineColor = up ? '#10B981' : '#EF4444';

  const ownedValue = owned ? M(snap.price).times(owned.quantity) : M(0);
  const ownedCost = owned ? M(owned.avgCost).times(owned.quantity) : M(0);
  const ownedPl = ownedValue.minus(ownedCost);
  const ownedPlPct = ownedCost.gt(0) ? ownedPl.div(ownedCost).times(100) : M(0);
  const annualDiv = M(snap.price).times(owned?.quantity ?? 0).times(snap.template.dividendYield);
  const divPerHour = annualDiv.div(365 * 24);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={palette.textPrimary} />
            </Pressable>
            <View style={styles.headerInfo}>
              <View style={[styles.headerCircle, { backgroundColor: snap.template.color + '22' }]}>
                <Text style={[styles.headerCircleText, { color: snap.template.color }]}>{ticker.slice(0, 2)}</Text>
              </View>
              <View>
                <Text style={styles.headerName}>{snap.template.name}</Text>
                <Text style={styles.headerTicker}>{ticker} · {snap.template.sector}</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.priceMain}>{formatMoney(snap.price)}</Text>
            <View style={styles.changeRow}>
              <Ionicons name={up ? 'caret-up' : 'caret-down'} size={14} color={up ? palette.success : palette.danger} />
              <Text style={[styles.changePct, { color: up ? palette.success : palette.danger }]}>
                {formatMoney(Math.abs(snap.price - snap.series[0]))} ({Math.abs(snap.changePct).toFixed(2)}%)
              </Text>
            </View>
          </View>

          {/* Chart */}
          <View style={styles.chartWrap}>
            <Svg width={W} height={H + 4}>
              <Defs>
                <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
                  <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
                </SvgGradient>
              </Defs>
              <Path d={fillPath} fill="url(#grad)" />
              <Path d={pts} fill="none" stroke={lineColor} strokeWidth={2} />
            </Svg>
            {/* Y-axis labels */}
            <Text style={[styles.chartLabel, { top: 0 }]}>{max.toFixed(2)}</Text>
            <Text style={[styles.chartLabel, { bottom: 4 }]}>{min.toFixed(2)}</Text>
          </View>

          {/* Buy/Sell toggle */}
          <View style={styles.modeRow}>
            <Pressable onPress={() => setMode('buy')} style={[styles.modeBtn, mode === 'buy' && styles.modeBtnActive]}>
              <Text style={[styles.modeBtnText, mode === 'buy' && styles.modeBtnTextActive]}>Buy</Text>
            </Pressable>
            <Pressable onPress={() => setMode('sell')} style={[styles.modeBtn, mode === 'sell' && styles.modeSellActive]}>
              <Text style={[styles.modeBtnText, mode === 'sell' && styles.modeBtnTextActive]}>Sell</Text>
            </Pressable>
          </View>

          <View style={styles.tradeCard}>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Quantity</Text>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => setQty(String(Math.max(1, qtyNum - 1)))} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={18} color={palette.textPrimary} />
                </Pressable>
                <TextInput
                  value={qty} onChangeText={setQty}
                  keyboardType="numeric" style={styles.qtyInput}
                  selectTextOnFocus
                />
                <Pressable onPress={() => setQty(String(qtyNum + 1))} style={styles.qtyBtn}>
                  <Ionicons name="add" size={18} color={palette.textPrimary} />
                </Pressable>
                {mode === 'buy' ? (
                  <Pressable onPress={() => { const max = Math.floor(balance.div(snap.price).toNumber()); setQty(String(Math.max(1, max))); }} style={styles.maxBtn}>
                    <Text style={styles.maxBtnText}>Max</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => setQty(String(owned?.quantity ?? 0))} style={styles.maxBtn}>
                    <Text style={styles.maxBtnText}>All</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Price per share</Text>
              <Text style={styles.tradeValue}>{formatMoney(snap.price)}</Text>
            </View>
            <View style={[styles.tradeRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.tradeLabel}>Total</Text>
              <Text style={styles.tradeTotalValue}>{formatMoney(total)}</Text>
            </View>
            <Text style={styles.tradeHint}>
              {mode === 'buy' ? `Balance: ${formatMoney(balance)}` : `Owned: ${owned?.quantity ?? 0} pcs`}
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (mode === 'buy') {
                  const ok = buy(ticker, qtyNum, snap.price);
                  if (!ok) showAlert({ title: "Can't buy", message: `You need ${formatMoney(total)} to buy ${qtyNum} ${ticker}.`, icon: 'cash-outline', variant: 'danger' });
                } else {
                  const ok = sell(ticker, qtyNum, snap.price);
                  if (!ok) showAlert({ title: "Can't sell", message: `You only own ${owned?.quantity ?? 0} shares.`, icon: 'alert-circle', variant: 'danger' });
                }
              }}
              style={[styles.tradeBtn, mode === 'sell' && styles.tradeBtnSell, !(mode === 'buy' ? canBuy : canSell) && styles.tradeBtnDisabled]}
              disabled={!(mode === 'buy' ? canBuy : canSell)}
            >
              <Text style={styles.tradeBtnText}>{mode === 'buy' ? `Buy ${qtyNum} ${ticker}` : `Sell ${qtyNum} ${ticker}`}</Text>
            </TouchableOpacity>
          </View>

          {/* Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsHeading}>Details</Text>
            {owned ? (
              <>
                <DetailRow label="Total invested" value={formatMoney(ownedCost)} />
                <DetailRow label="Current value" value={`${formatMoney(ownedValue)} · ${ownedPl.gte(0) ? '+' : ''}${formatPercent(ownedPlPct)}`} valueColor={ownedPl.gte(0) ? palette.success : palette.danger} />
                <DetailRow label="Shares owned" value={`${owned.quantity} pcs`} />
                <DetailRow label="Avg. buy price" value={formatMoney(owned.avgCost)} />
              </>
            ) : null}
            <DetailRow label="Dividend yield" value={`${(snap.template.dividendYield * 100).toFixed(2)}% / yr`} />
            {owned ? <DetailRow label="Dividend income" value={`${formatMoney(divPerHour)}/hr`} /> : null}
            <DetailRow label="Sector" value={snap.template.sector} />
            <DetailRow label="Volatility" value={snap.template.volatility > 0.25 ? 'High' : snap.template.volatility > 0.12 ? 'Medium' : 'Low'} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  headerCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerCircleText: { ...typography.bodyMedium, fontWeight: '800' },
  headerName: { ...typography.title, color: palette.textPrimary },
  headerTicker: { ...typography.caption, color: palette.textSecondary },
  priceSection: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  priceMain: { ...typography.display, color: palette.textPrimary },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  changePct: { ...typography.bodyMedium },
  chartWrap: { marginHorizontal: spacing.lg, position: 'relative' },
  chartLabel: { position: 'absolute', left: 4, ...typography.micro, color: palette.textTertiary },
  modeRow: { flexDirection: 'row', margin: spacing.lg, backgroundColor: palette.surfaceAlt, borderRadius: radius.lg, padding: 4, gap: 4 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md },
  modeBtnActive: { backgroundColor: palette.primary },
  modeSellActive: { backgroundColor: palette.danger },
  modeBtnText: { ...typography.bodyMedium, color: palette.textSecondary },
  modeBtnTextActive: { color: '#FFFFFF', fontWeight: '700' },
  tradeCard: { marginHorizontal: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card, gap: spacing.sm },
  tradeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: palette.surfaceAlt },
  tradeLabel: { ...typography.body, color: palette.textSecondary },
  tradeValue: { ...typography.bodyMedium, color: palette.textPrimary },
  tradeTotalValue: { ...typography.title, color: palette.textPrimary },
  tradeHint: { ...typography.caption, color: palette.textTertiary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: palette.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { width: 64, textAlign: 'center', ...typography.title, color: palette.textPrimary, borderBottomWidth: 1, borderBottomColor: palette.border, paddingVertical: 4 },
  maxBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: palette.primarySoft, borderRadius: radius.pill },
  maxBtnText: { ...typography.micro, color: palette.primary, fontWeight: '700' },
  tradeBtn: { marginTop: spacing.sm, backgroundColor: palette.primary, paddingVertical: 14, borderRadius: radius.lg, alignItems: 'center' },
  tradeBtnSell: { backgroundColor: palette.danger },
  tradeBtnDisabled: { opacity: 0.5 },
  tradeBtnText: { ...typography.bodyMedium, color: '#FFFFFF', fontWeight: '700' },
  detailsCard: { margin: spacing.lg, backgroundColor: palette.surface, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card },
  detailsHeading: { ...typography.title, color: palette.textPrimary, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: palette.surfaceAlt },
  detailLabel: { ...typography.body, color: palette.textSecondary },
  detailValue: { ...typography.bodyMedium, color: palette.textPrimary },
});
