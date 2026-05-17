import { router } from 'expo-router';
import { useEffect } from 'react';

import { copy } from '@/copy/ru';
import { maskUrl } from '@/lib/maskSensitive';
import { useConnectionStore } from '@/store/connectionStore';
import { useHomeStore } from '@/store/homeStore';
import { DataSyncStatus } from '@/features/settings/ui/DataSyncStatus';
import { CalmButton } from '@/ui/CalmButton';
import { ScreenLayout } from '@/ui/ScreenLayout';

export default function SettingsScreen() {
  const isConnected = useConnectionStore((s) => s.isConnected);
  const baseUrl = useConnectionStore((s) => s.baseUrl);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const syncDebug = useHomeStore((s) => s.syncDebug);
  const isRefreshing = useHomeStore((s) => s.isRefreshing);
  const refresh = useHomeStore((s) => s.refresh);

  useEffect(() => {
    if (isConnected) void refresh();
  }, [isConnected, refresh]);

  async function handleReconnect() {
    await disconnect();
    router.replace('/onboarding');
  }

  return (
    <ScreenLayout title={copy.settings.screenTitle}>
      <DataSyncStatus
        isConnected={isConnected}
        baseUrl={baseUrl ? maskUrl(baseUrl) : null}
        syncDebug={syncDebug}
        isRefreshing={isRefreshing}
        onRefresh={() => void refresh()}
      />
      <CalmButton
        label={copy.settings.haDevicesList}
        variant="primary"
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
