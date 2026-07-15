import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';

/** Слоты датчиков спальни в порядке отображения */
export const BEDROOM_SENSOR_SLOTS: readonly TBedroomSensorSlot[] = [
  'temperature',
  'humidity',
  'co2',
  'pressure',
] as const;
