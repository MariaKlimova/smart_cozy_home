import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import type { TBedroomDeviceSlot } from '@/config/bedroomDeviceSlotMapping.typings';
import { DevicePickerScreen } from '@/features/settings/ui/DevicePickerScreen';
import { BEDROOM_DEVICE_SLOTS } from '@/features/settings/ui/BedroomDevicesScreen/BedroomDevicesScreen.const';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

function isBedroomDeviceSlot(value: string): value is TBedroomDeviceSlot {
  return (BEDROOM_DEVICE_SLOTS as readonly string[]).includes(value);
}

export default function DevicePickerRoute() {
  const params = useLocalSearchParams<{ slot?: string }>();
  const c = useThemeColors();
  const slotParam = typeof params.slot === 'string' ? params.slot : '';

  useEffect(() => {
    if (!isBedroomDeviceSlot(slotParam)) {
      router.back();
    }
  }, [slotParam]);

  if (!isBedroomDeviceSlot(slotParam)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={[typography.body, { color: c.textMuted }]}>…</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: copy.devicePicker.screenTitle }} />
      <DevicePickerScreen slot={slotParam} />
    </>
  );
}
