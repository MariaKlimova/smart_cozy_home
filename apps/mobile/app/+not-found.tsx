import { Stack } from 'expo-router';

import { copy } from '@/copy/ru';
import { NotFoundScreen } from '@/ui/NotFoundScreen';

export default function NotFoundRoute() {
  return (
    <>
      <Stack.Screen options={{ title: copy.notFound.screenTitle }} />
      <NotFoundScreen />
    </>
  );
}
