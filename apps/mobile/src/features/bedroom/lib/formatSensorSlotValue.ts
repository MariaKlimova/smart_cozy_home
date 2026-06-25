import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import { copy } from '@/copy/ru';
import type { IBedroomReadings } from '@/features/now/lib/bedroomReadings.typings';
import type { TBedroomSlotUiState } from '@/features/settings/lib/bedroomSensorSlotState';

/** Подпись значения датчика для карточки на вкладке «Датчики» */
export function formatSensorSlotValue(
  slot: TBedroomSensorSlot,
  readings: IBedroomReadings | undefined,
  uiState: TBedroomSlotUiState,
): string {
  if (uiState === 'disabled') {
    return copy.bedroom.sensors.notUsed;
  }

  if (slot === 'temperature') {
    if (readings?.temperatureC !== undefined) {
      return `${Math.round(readings.temperatureC)}°`;
    }
    return uiState === 'unset' ? copy.bedroom.sensors.notConfigured : copy.bedroom.unavailable;
  }

  if (slot === 'humidity') {
    if (readings?.humidityPct !== undefined) {
      return `${Math.round(readings.humidityPct)}%`;
    }
    return uiState === 'unset' ? copy.bedroom.sensors.notConfigured : copy.bedroom.unavailable;
  }

  if (readings?.co2Ppm !== undefined) {
    return `${Math.round(readings.co2Ppm)} ppm`;
  }

  if (uiState === 'unset') {
    return copy.bedroom.sensors.notConfigured;
  }

  return copy.bedroom.unavailable;
}
