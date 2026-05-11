import React from 'react';
import { useTickLoop } from '../hooks/useTickLoop';
import { OfflineEarningsModal } from './OfflineEarningsModal';

export function OfflineEarningsHost() {
  const { offline, dismissOffline } = useTickLoop();
  return (
    <OfflineEarningsModal
      visible={!!offline}
      amount={offline?.gained ?? 0}
      elapsedMs={offline?.elapsedMs ?? 0}
      onCollect={dismissOffline}
    />
  );
}
