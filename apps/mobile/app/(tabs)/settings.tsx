import { router } from 'expo-router';
import { useEffect } from 'react';

import { clearConnectionProfile } from '@/ha/connectionStorage';
import { maskUrl } from '@/lib/maskSensitive';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { DataSyncStatus } from '@/features/settings/ui/DataSyncStatus';
import { CalmButton } from '@/ui/CalmButton';
import { ScreenLayout } from '@/ui/ScreenLayout';

export default function SettingsScreen() {
  const isConnected = useConnectionStore((s) => s.isConnected);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const syncDebug = useHomeStore((s) => s.syncDebug);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const refresh = useHomeStore((s) => s.refresh);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  async function handleReconnect() {
    await clearConnectionProfile();
    useConnectionStore.setState({
      profile: null,
      baseUrl: null,
      isConnected: false,
    });
    router.replace('/onboarding');
  }

  return (
    <ScreenLayout title="Настройки">
      <DataSyncStatus
        isConnected={isConnected}
        baseUrl={baseUrl ? maskUrl(baseUrl) : null}
        syncDebug={syncDebug}
        isRefreshing={isRefreshing}
        onRefresh={() => void refresh()}
      />
      <CalmButton
        label="Список устройств Home Assistant"
        variant="primary"
        onPress={() => router.push('/ha-entities')}
        disabled={!isConnected}
      />
      <CalmButton
        label="Изменить подключение к дому"
        variant="secondary"
        onPress={handleReconnect}
      />
    </ScreenLayout>
  );
}
