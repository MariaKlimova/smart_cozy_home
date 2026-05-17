import { Stack } from 'expo-router';

import { copy } from '@/copy/ru';
import { HaEntitiesScreen } from '@/features/settings/ui/HaEntitiesScreen';

export default function HaEntitiesRoute() {
  return (
    <>
      <Stack.Screen options={{ title: copy.haEntities.screenTitle }} />
      <HaEntitiesScreen />
    </>
  );
}
