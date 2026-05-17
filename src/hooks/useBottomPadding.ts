import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AD_HEIGHT = 56;
const TAB_HEIGHT = 58;

export function useBottomPadding() {
  const insets = useSafeAreaInsets();
  return AD_HEIGHT + TAB_HEIGHT + Math.max(insets.bottom, 8);
}
