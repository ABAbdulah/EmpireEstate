import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../src/store/gameStore';
import { palette } from '../src/theme';

export default function RootLayout() {
  const hydrated = useGame((s) => s.hydrated);
  const hydrate = useGame((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, []);

  if (!ready || !hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="business/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="car-business/[id]/index" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="car-business/[id]/market" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="car-business/[id]/skills" options={{ presentation: 'card', animation: 'slide_from_right' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
});
