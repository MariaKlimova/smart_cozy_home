import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { copy } from '@/copy/ru';
import { BedroomDevicesScreen } from '@/features/settings/ui/BedroomDevicesScreen';
import { useEntitiesStore } from '@/store/entitiesStore';

export default function BedroomDevicesRoute() {
  const load = useEntitiesStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Stack.Screen options={{ title: copy.settings.bedroomDevices.screenTitle }} />
      <BedroomDevicesScreen />
    </>
  );
}
