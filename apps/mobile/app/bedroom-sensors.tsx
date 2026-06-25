import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { copy } from '@/copy/ru';
import { BedroomSensorsScreen } from '@/features/settings/ui/BedroomSensorsScreen';
import { useEntitiesStore } from '@/store/entitiesStore';

export default function BedroomSensorsRoute() {
  const load = useEntitiesStore((s) => s.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <Stack.Screen options={{ title: copy.settings.bedroomSensors.screenTitle }} />
      <BedroomSensorsScreen />
    </>
  );
}
