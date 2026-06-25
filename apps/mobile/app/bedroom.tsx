import { Stack, useLocalSearchParams } from 'expo-router';

import { copy } from '@/copy/ru';
import { BedroomScreen } from '@/features/bedroom/ui/BedroomScreen';
import type { TBedroomTabId } from '@/features/bedroom/ui/BedroomScreen';

function parseInitialTab(tab: string | string[] | undefined): TBedroomTabId | undefined {
  const value = typeof tab === 'string' ? tab : undefined;
  if (value === 'devices' || value === 'sensors') {
    return value;
  }
  return undefined;
}

export default function BedroomRoute() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab = parseInitialTab(params.tab);

  return (
    <>
      <Stack.Screen options={{ title: copy.bedroom.screenTitle }} />
      <BedroomScreen initialTab={initialTab} />
    </>
  );
}
