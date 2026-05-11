import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { palette, typography } from '../../src/theme';
import { OfflineEarningsHost } from '../../src/components/OfflineEarningsHost';

interface IconProps { focused: boolean; name: keyof typeof Ionicons.glyphMap; nameOutline: keyof typeof Ionicons.glyphMap; badge?: string }
function TabIcon({ focused, name, nameOutline, badge }: IconProps) {
  return (
    <View style={{ alignItems: 'center', position: 'relative' }}>
      <Ionicons name={focused ? name : nameOutline} size={22} color={focused ? palette.primary : palette.textTertiary} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <>
      <Tabs
        initialRouteName="earnings"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.textTertiary,
          tabBarLabelStyle: { ...typography.micro, marginBottom: 2 },
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
            paddingTop: 6,
            height: Platform.OS === 'ios' ? 84 : 64,
          },
        }}
      >
        <Tabs.Screen
          name="investing"
          options={{
            title: 'Investing',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="trending-up" nameOutline="trending-up-outline" />,
          }}
        />
        <Tabs.Screen
          name="business"
          options={{
            title: 'Business',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="business" nameOutline="business-outline" />,
          }}
        />
        <Tabs.Screen
          name="earnings"
          options={{
            title: 'Earnings',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="cash" nameOutline="cash-outline" badge="New" />,
          }}
        />
        <Tabs.Screen
          name="items"
          options={{
            title: 'Items',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="grid" nameOutline="grid-outline" />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="person-circle" nameOutline="person-circle-outline" />,
          }}
        />
      </Tabs>
      <OfflineEarningsHost />
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -14,
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: '#8B7CE0',
    borderRadius: 6,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
});
