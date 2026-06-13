import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SessionProvider } from '@/lib/session';
import { CurrentPotProvider } from '@/lib/currentPot';
import { C } from '@/lib/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <SessionProvider>
        <CurrentPotProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.bg },
              animation: 'fade',
            }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="create" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="join/[code]" />
          </Stack>
        </CurrentPotProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
