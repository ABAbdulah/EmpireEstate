import React, { useEffect, useRef, useState } from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import Decimal from 'decimal.js';
import { formatMoney } from '../lib/money';

interface Props extends TextProps {
  value: Decimal.Value;
  animate?: boolean;
  durationMs?: number;
  style?: TextStyle | TextStyle[];
  prefix?: string;
}

export function MoneyText({ value, animate = true, durationMs = 350, style, prefix = '$', ...rest }: Props) {
  const target = new Decimal(value);
  const prevRef = useRef<Decimal>(target);
  const [display, setDisplay] = useState<string>(formatMoney(target, { prefix }));

  useEffect(() => {
    if (!animate) {
      prevRef.current = target;
      setDisplay(formatMoney(target, { prefix }));
      return;
    }
    const start = performance.now();
    const from = prevRef.current;
    const to = target;
    const diff = to.minus(from);
    if (diff.isZero()) {
      setDisplay(formatMoney(to, { prefix }));
      return;
    }
    let raf: number;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - k, 3);
      const curr = from.plus(diff.times(eased));
      setDisplay(formatMoney(curr, { prefix }));
      if (k < 1) raf = requestAnimationFrame(step);
      else prevRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target.toString(), durationMs, animate, prefix]);

  return <Text style={style} {...rest}>{display}</Text>;
}
