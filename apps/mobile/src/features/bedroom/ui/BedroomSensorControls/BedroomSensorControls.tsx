import { View } from 'react-native';

import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import { BEDROOM_SENSOR_SLOTS } from '@/config/bedroomSensorSlots';
import { copy } from '@/copy/ru';
import { formatSensorSlotValue } from '@/features/bedroom/lib/formatSensorSlotValue';
import { getBedroomSlotUiState } from '@/features/settings/lib/bedroomSensorSlotState';

import { BedroomSensorControlsCard } from './-Card';
import type { IBedroomSensorControlsProps } from './BedroomSensorControls.typings';
import { styles } from './BedroomSensorControls.styles';

function slotLabel(slot: TBedroomSensorSlot): string {
  if (slot === 'temperature') return copy.now.metrics.temperature;
  if (slot === 'humidity') return copy.now.metrics.humidity;
  if (slot === 'co2') return copy.now.metrics.co2;
  return copy.now.metrics.pressure;
}

export function BedroomSensorControls({
  readings,
  overrides,
  onConfigureSensor,
}: IBedroomSensorControlsProps) {
  return (
    <View style={styles.list}>
      {BEDROOM_SENSOR_SLOTS.map((slot) => {
        const uiState = getBedroomSlotUiState(overrides, slot);
        const valueLabel = formatSensorSlotValue(slot, readings, uiState);

        return (
          <BedroomSensorControlsCard
            key={slot}
            slot={slot}
            label={slotLabel(slot)}
            valueLabel={valueLabel}
            uiState={uiState}
            onConfigure={() => onConfigureSensor(slot)}
          />
        );
      })}
    </View>
  );
}
