import { useEffect, useRef, useCallback } from 'react';

// Safely import the native module — not available in Expo Go
let InterstitialAd: any = null;
let AdEventType: any = null;
try {
  const mod = require('react-native-google-mobile-ads');
  InterstitialAd = mod.InterstitialAd;
  AdEventType = mod.AdEventType;
} catch {
  // Running in Expo Go — native module not compiled in
}

import { AD_UNITS } from '../lib/ads';

const SHOW_EVERY_N = 5;
let actionCount = 0;

export function useInterstitialAd() {
  const adRef = useRef<any>(null);
  const readyRef = useRef(false);

  const load = useCallback(() => {
    if (!InterstitialAd) return;
    readyRef.current = false;
    const ad = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);

    ad.addAdEventListener(AdEventType.LOADED, () => { readyRef.current = true; });
    ad.addAdEventListener(AdEventType.CLOSED, () => load());
    ad.addAdEventListener(AdEventType.ERROR, () => setTimeout(load, 30_000));

    adRef.current = ad;
    ad.load();
  }, []);

  useEffect(() => {
    load();
  }, []);

  const onAction = useCallback(() => {
    if (!InterstitialAd) return;
    actionCount += 1;
    if (actionCount % SHOW_EVERY_N === 0 && readyRef.current && adRef.current) {
      adRef.current.show();
    }
  }, []);

  return { onAction };
}
