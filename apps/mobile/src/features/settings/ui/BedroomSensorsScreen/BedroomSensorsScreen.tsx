import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { copy } from '@/copy/ru';
import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import { useBedroomSensorPreview } from '@/features/settings/hooks/useBedroomSensorPreview';
import {
  getBedroomSlotEntityId,
  getBedroomSlotUiState,
} from '@/features/settings/lib/bedroomSensorSlotState';
import { BedroomSensorSlot } from '@/features/settings/ui/BedroomSensorSlot';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useBedroomSensorStore } from '@/store/bedroomSensorStore';
import { useEntitiesStore } from '@/store/entitiesStore';
import { typography, spacing } from '@/theme/tokens';

import type { IBedroomSensorsScreenProps } from './BedroomSensorsScreen.typings';
import { styles } from './BedroomSensorsScreen.styles';

const SLOTS: TBedroomSensorSlot[] = ['temperature', 'humidity', 'co2'];

function slotLabel(slot: TBedroomSensorSlot): string {
  if (slot === 'temperature') return copy.now.metrics.temperature;
  if (slot === 'humidity') return copy.now.metrics.humidity;
  return copy.now.metrics.co2;
}

export function BedroomSensorsScreen(_props: IBedroomSensorsScreenProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const overrides = useBedroomSensorStore((s) => s.overrides);
  const setSlot = useBedroomSensorStore((s) => s.setSlot);
  const items = useEntitiesStore((s) => s.items);
  const { getPreview } = useBedroomSensorPreview();

  const friendlyByEntity = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.entityId, item.friendlyName);
    }
    return map;
  }, [items]);

  function openPicker(slot: TBedroomSensorSlot) {
    router.push({ pathname: '/sensor-picker', params: { slot } });
  }

  async function handleClear(slot: TBedroomSensorSlot) {
    await setSlot(slot, null);
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
    >
      <Text style={[typography.caption, styles.hint, { color: c.textMuted }]}>
        {copy.settings.bedroomSensors.hint}
      </Text>

      {SLOTS.map((slot, index) => {
        const uiState = getBedroomSlotUiState(overrides, slot);
        const entityId = getBedroomSlotEntityId(overrides, slot);
        const deviceName = entityId ? (friendlyByEntity.get(entityId) ?? entityId) : null;
        const isLast = index === SLOTS.length - 1;

        return (
          <View key={slot} style={isLast ? undefined : styles.slotSpacing}>
            <BedroomSensorSlot
              slot={slot}
              label={slotLabel(slot)}
              deviceName={deviceName}
              preview={getPreview(slot, entityId)}
              isUnset={uiState === 'unset'}
              isDisabled={uiState === 'disabled'}
              onChange={() => openPicker(slot)}
              onClear={() => void handleClear(slot)}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
