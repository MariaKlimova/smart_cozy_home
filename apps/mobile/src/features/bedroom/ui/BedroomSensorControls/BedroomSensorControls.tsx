import { View } from 'react-native';

import { copy } from '@/copy/ru';
import { formatSensorSlotValue } from '@/features/bedroom/lib/formatSensorSlotValue';
import { getBedroomSlotUiState } from '@/features/settings/lib/bedroomSensorSlotState';

import { BedroomSensorControlsCard } from './-Card';
import { BEDROOM_SENSOR_SLOTS } from './BedroomSensorControls.const';
import type { IBedroomSensorControlsProps } from './BedroomSensorControls.typings';
import { styles } from './BedroomSensorControls.styles';

function slotLabel(slot: (typeof BEDROOM_SENSOR_SLOTS)[number]): string {
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
