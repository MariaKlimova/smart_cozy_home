import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { copy } from '@/copy/ru';
import { AppProviders } from '@/providers/AppProviders';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useConnectionStore } from '@/store/connectionStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasHydrated = useConnectionStore((s) => s.hasHydrated);
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && hasHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, hasHydrated]);

  if (!loaded || !hasHydrated) {
    return null;
  }

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const hasHydrated = useConnectionStore((s) => s.hasHydrated);
  const isConnected = useConnectionStore((s) => s.isConnected);
  const profile = useConnectionStore((s) => s.profile);

  // Редирект только после hydrate (см. connectionStore): иначе profile=null
  // на холодном старте уводит на onboarding и даёт мигание экранов.
  // Onboarding — только без сохранённого профиля; офлайн с профилем остаётся на табах.
  useEffect(() => {
    if (!hasHydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    const needsOnboarding = !profile;
    if (needsOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (profile && isConnected && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasHydrated, isConnected, profile, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="ha-entities"
          options={{ title: copy.haEntities.screenTitle, headerShown: true }}
        />
      </Stack>
    </ThemeProvider>
  );
}
