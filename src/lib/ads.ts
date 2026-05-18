import { Platform } from 'react-native';

// Production Ad Unit IDs
const REWARDED_ANDROID = 'ca-app-pub-5981604331189884/3362106643';
const REWARDED_IOS     = 'ca-app-pub-5981604331189884/3362106643'; // replace with iOS unit ID once created

const INTERSTITIAL_ANDROID = 'ca-app-pub-5981604331189884/9990945780';
const INTERSTITIAL_IOS     = 'ca-app-pub-5981604331189884/9990945780';

export const AD_UNITS = {
  rewarded:     Platform.OS === 'ios' ? REWARDED_IOS     : REWARDED_ANDROID,
  interstitial: Platform.OS === 'ios' ? INTERSTITIAL_IOS : INTERSTITIAL_ANDROID,
};
