import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { copy } from '@/copy/ru';
import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import { BEDROOM_SENSOR_SLOTS } from '@/config/bedroomSensorSlots';
import { SensorPickerScreen } from '@/features/settings/ui/SensorPickerScreen';
import { useThemeColors } from '@/hooks/useThemeColors';
import { typography } from '@/theme/tokens';

function isBedroomSensorSlot(value: string): value is TBedroomSensorSlot {
  return BEDROOM_SENSOR_SLOTS.includes(value as TBedroomSensorSlot);
}

export default function SensorPickerRoute() {
  const params = useLocalSearchParams<{ slot?: string }>();
  const c = useThemeColors();
  const slotParam = typeof params.slot === 'string' ? params.slot : '';

  useEffect(() => {
    if (!isBedroomSensorSlot(slotParam)) {
      router.back();
    }
  }, [slotParam]);

  if (!isBedroomSensorSlot(slotParam)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={[typography.body, { color: c.textMuted }]}>…</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: copy.sensorPicker.screenTitle }} />
      <SensorPickerScreen slot={slotParam} />
    </>
  );
}
