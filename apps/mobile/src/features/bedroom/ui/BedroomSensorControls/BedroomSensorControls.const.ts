import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';

/** Локальные константы блока */
export const BEDROOM_SENSOR_CONTROLS_BLOCK_NAME = 'BedroomSensorControls' as const;

/** Слоты датчиков спальни в порядке отображения */
export const BEDROOM_SENSOR_SLOTS: TBedroomSensorSlot[] = [
  'temperature',
  'humidity',
  'co2',
  'pressure',
];
