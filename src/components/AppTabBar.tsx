import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, typography } from '../theme';
import { AdBanner } from './AdBanner';

export function AppTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { state, descriptors, navigation } = props;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <AdBanner />
      <View style={styles.tabRow}>
        {state.routes.map((route, idx) => {
          const { options } = descriptors[route.key];
          const focused = state.index === idx;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };
          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });
          const Icon = options.tabBarIcon as ((props: { focused: boolean; color: string; size: number }) => React.ReactNode) | undefined;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : undefined}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              hitSlop={6}
            >
              <View style={styles.iconBox}>
                {Icon ? Icon({ focused, color: focused ? palette.primary : palette.textTertiary, size: 22 }) : null}
              </View>
              <Text style={[styles.label, { color: focused ? palette.primary : palette.textTertiary }]}>{options.title ?? route.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  iconBox: { height: 26, alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.micro, fontWeight: '500' },
});
