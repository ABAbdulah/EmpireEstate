import { useEffect, useRef, useState, useCallback } from 'react';

export type RewardedAdState = 'unavailable' | 'loading' | 'ready' | 'showing' | 'error';

// Safely import the native module — not available in Expo Go
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let AdEventType: any = null;
try {
  const mod = require('react-native-google-mobile-ads');
  RewardedAd = mod.RewardedAd;
  RewardedAdEventType = mod.RewardedAdEventType;
  AdEventType = mod.AdEventType;
} catch {
  // Running in Expo Go — native module not compiled in
}

import { AD_UNITS } from '../lib/ads';

export function useRewardedAd(onRewarded: () => void) {
  const adRef = useRef<any>(null);
  const [adState, setAdState] = useState<RewardedAdState>(
    RewardedAd ? 'loading' : 'unavailable'
  );

  const load = useCallback(() => {
    if (!RewardedAd) return;
    setAdState('loading');
    const ad = RewardedAd.createForAdRequest(AD_UNITS.rewarded, {
      requestNonPersonalizedAdsOnly: false,
    });

    ad.addAdEventListener(RewardedAdEventType.LOADED, () => setAdState('ready'));
    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => onRewarded());
    ad.addAdEventListener(AdEventType.CLOSED, () => load());
    ad.addAdEventListener(AdEventType.ERROR, () => {
      setAdState('error');
      setTimeout(load, 30_000);
    });

    adRef.current = ad;
    ad.load();
  }, [onRewarded]);

  useEffect(() => {
    load();
  }, []);

  const show = useCallback(() => {
    if (adState !== 'ready' || !adRef.current) return;
    setAdState('showing');
    adRef.current.show();
  }, [adState]);

  return { adState, show };
}
