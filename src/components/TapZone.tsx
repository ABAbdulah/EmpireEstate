import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Decimal from 'decimal.js';
import { palette, radius, spacing, typography } from '../theme';
import { formatMoney } from '../lib/money';

interface Floater {
  id: number;
  amount: string;
  x: number;
  y: number;
}

interface Props {
  onTap: () => Decimal;
  hapticsEnabled?: boolean;
}

export function TapZone({ onTap, hapticsEnabled = true }: Props) {
  const scale = useSharedValue(1);
  const ripple = useSharedValue(0);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const idRef = useRef(0);

  const handleTap = (evt: { nativeEvent: { locationX: number; locationY: number } }) => {
    const reward = onTap();
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    scale.value = withSequence(withSpring(0.96, { mass: 0.4, stiffness: 300 }), withSpring(1, { mass: 0.4, stiffness: 200 }));
    ripple.value = 0;
    ripple.value = withTiming(1, { duration: 500 });

    const id = ++idRef.current;
    setFloaters((arr) => [...arr, { id, amount: '+' + formatMoney(reward), x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY }]);
    setTimeout(() => setFloaters((arr) => arr.filter((f) => f.id !== id)), 850);
  };

  const handStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: 1 - ripple.value,
    transform: [{ scale: 0.5 + ripple.value * 1.4 }],
  }));

  return (
    <Pressable onPress={handleTap} style={styles.tapArea}>
      <Animated.View style={[styles.ripple, rippleStyle]} pointerEvents="none" />
      <Animated.View style={[styles.handWrap, handStyle]}>
        <View style={styles.handCircle}>
          <Text style={styles.handEmoji}>👆</Text>
        </View>
        <Text style={styles.hint}>Tap here to earn</Text>
      </Animated.View>
      {floaters.map((f) => (
        <Floater key={f.id} x={f.x} y={f.y} amount={f.amount} />
      ))}
    </Pressable>
  );
}

function Floater({ x, y, amount }: { x: number; y: number; amount: string }) {
  const opacity = useSharedValue(1);
  const offset = useSharedValue(0);
  React.useEffect(() => {
    opacity.value = withTiming(0, { duration: 800 });
    offset.value = withTiming(-60, { duration: 800 });
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.floater, { left: x - 20, top: y - 20 }, style]}>
      <Text style={styles.floaterText}>{amount}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tapArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  handWrap: { alignItems: 'center' },
  handCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: palette.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  handEmoji: { fontSize: 60 },
  hint: {
    ...typography.body,
    color: palette.textSecondary,
  },
  ripple: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: palette.primary + '18',
  },
  floater: {
    position: 'absolute',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.success,
  },
  floaterText: { ...typography.caption, color: '#FFFFFF', fontWeight: '700' },
});
