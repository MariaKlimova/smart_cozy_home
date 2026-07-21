import { router } from 'expo-router';
import { useEffect } from 'react';

import { copy } from '@/copy/ru';
import { maskUrl } from '@/lib/maskSensitive';
import { isHaMocksEnabled } from '@/features/settings/lib/isHaMocksEnabled';
import { NightScheduleSection } from '@/features/settings/ui/NightScheduleSection';
import {
  ONBOARDING_EDIT_PARAM,
  ONBOARDING_EDIT_VALUE,
} from '@/features/onboarding/ui/OnboardingScreen';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { useSleepScheduleStore } from '@/store/sleepScheduleStore';
import { DataSyncStatus } from '@/features/settings/ui/DataSyncStatus';
import { CalmButton } from '@/ui/CalmButton';
import { ScreenLayout } from '@/ui/ScreenLayout';

export default function SettingsScreen() {
  const isConnected = useConnectionStore((s) => s.isConnected);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const syncDebug = useHomeStore((s) => s.syncDebug);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const refresh = useHomeStore((s) => s.refresh);
  const schedule = useSleepScheduleStore((s) => s.schedule);
  const setSchedule = useSleepScheduleStore((s) => s.setSchedule);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  function handleReconnect() {
    router.push(`/onboarding?${ONBOARDING_EDIT_PARAM}=${ONBOARDING_EDIT_VALUE}`);
  }

  return (
    <ScreenLayout title={copy.settings.screenTitle}>
      <NightScheduleSection
        bedtime={schedule.bedtime}
        wakeTime={schedule.wakeTime}
        onBedtimeChange={(bedtime: string) => void setSchedule((prev) => ({ ...prev, bedtime }))}
        onWakeTimeChange={(wakeTime: string) => void setSchedule((prev) => ({ ...prev, wakeTime }))}
      />
      <DataSyncStatus
        isConnected={isConnected}
        baseUrl={baseUrl ? maskUrl(baseUrl) : null}
        syncDebug={syncDebug}
        isRefreshing={isRefreshing}
        mocksEnabled={isHaMocksEnabled()}
        onRefresh={() => void refresh()}
      />
      <CalmButton
        label={copy.settings.haDevicesList}
        variant="secondary"
        onPress={() => router.push('/ha-entities')}
        disabled={!isConnected}
      />
      <CalmButton
        label={copy.settings.reconnect}
        variant="secondary"
        onPress={handleReconnect}
      />
    </ScreenLayout>
  );
}
