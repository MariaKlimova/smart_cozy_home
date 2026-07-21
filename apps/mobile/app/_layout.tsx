import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useGlobalSearchParams, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { copy } from '@/copy/ru';
import {
  ONBOARDING_EDIT_PARAM,
  ONBOARDING_EDIT_VALUE,
} from '@/features/onboarding/ui/OnboardingScreen';
import { AppProviders } from '@/providers/AppProviders';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useBedroomDeviceStore } from '@/store/bedroomDeviceStore';
import { useConnectionStore } from '@/store/connectionStore';
import { useSleepScheduleStore } from '@/store/sleepScheduleStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasConnectionHydrated = useConnectionStore((s) => s.hasHydrated);
  const hasSensorMappingHydrated = useBedroomSensorStore((s) => s.hasHydrated);
  const hasDeviceMappingHydrated = useBedroomDeviceStore((s) => s.hasHydrated);
  const hasSleepScheduleHydrated = useSleepScheduleStore((s) => s.hasHydrated);
  const hasHydrated =
    hasConnectionHydrated &&
    hasSensorMappingHydrated &&
    hasDeviceMappingHydrated &&
    hasSleepScheduleHydrated;
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
  const searchParams = useGlobalSearchParams();
  const hasHydrated = useConnectionStore((s) => s.hasHydrated);
  const isConnected = useConnectionStore((s) => s.isConnected);
  const profile = useConnectionStore((s) => s.profile);

  const editParam = searchParams[ONBOARDING_EDIT_PARAM];
  const editValue = Array.isArray(editParam) ? editParam[0] : editParam;
  const isEditingConnection = editValue === ONBOARDING_EDIT_VALUE;

  // Редирект только после hydrate (см. connectionStore): иначе profile=null
  // на холодном старте уводит на onboarding и даёт мигание экранов.
  // Onboarding — только без сохранённого профиля; офлайн с профилем остаётся на табах.
  // Режим edit=1 (смена подключения из настроек) не перехватываем.
  useEffect(() => {
    if (!hasHydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    const needsOnboarding = !profile;
    if (needsOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (profile && isConnected && inOnboarding && !isEditingConnection) {
      router.replace('/(tabs)');
    }
  }, [hasHydrated, isConnected, isEditingConnection, profile, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="ha-entities"
          options={{ title: copy.haEntities.screenTitle, headerShown: true }}
        />
        <Stack.Screen
          name="bedroom-sensors"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sensor-picker"
          options={{
            title: copy.sensorPicker.screenTitle,
            headerShown: true,
            headerBackTitle: copy.bedroom.screenTitle,
          }}
        />
        <Stack.Screen
          name="bedroom-devices"
          options={{
            title: copy.settings.bedroomDevices.screenTitle,
            headerShown: true,
            headerBackTitle: copy.bedroom.screenTitle,
          }}
        />
        <Stack.Screen
          name="device-picker"
          options={{
            title: copy.devicePicker.screenTitle,
            headerShown: true,
            headerBackTitle: copy.bedroom.screenTitle,
          }}
        />
        <Stack.Screen
          name="scenario-settings"
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="bedroom"
          options={{
            title: copy.bedroom.screenTitle,
            headerShown: true,
            headerBackTitle: copy.rooms.sectionTitle,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
