import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Decimal from 'decimal.js';
import { useGame } from '../store/gameStore';
import { OFFLINE_CAP_FREE_MS, OFFLINE_CAP_VIP_MS } from '../lib/time';

export interface OfflineSummary {
  gained: Decimal;
  elapsedMs: number;
}

export function useTickLoop() {
  const tick = useGame((s) => s.tick);
  const hydrated = useGame((s) => s.hydrated);
  const lastTickAt = useGame((s) => s.state.lastTickAt);
  const vip = useGame((s) => s.state.vip);

  const [offline, setOffline] = useState<OfflineSummary | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (handledRef.current) return;
    handledRef.current = true;

    const now = Date.now();
    const elapsedMs = Math.max(0, now - lastTickAt);
    const cap = vip ? OFFLINE_CAP_VIP_MS : OFFLINE_CAP_FREE_MS;
    const cappedMs = Math.min(elapsedMs, cap);
    const { gained } = tick(now);
    if (gained.gte('0.01') && cappedMs > 30_000) {
      setOffline({ gained: gained as unknown as Decimal, elapsedMs: cappedMs });
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const id = setInterval(() => {
      tick(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [hydrated]);

  useEffect(() => {
    const handle = (state: AppStateStatus) => {
      if (state === 'active') tick(Date.now());
    };
    const sub = AppState.addEventListener('change', handle);
    return () => sub.remove();
  }, []);

  return { offline, dismissOffline: () => setOffline(null) };
}
