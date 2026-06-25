import type { IBedroomReadings } from '@/features/now/lib/bedroomReadings.typings';
import type { IBedroomSensorMapping } from '@/config/bedroomSensorMapping.typings';

export interface IBedroomSensorControlsProps {
  /** Показания датчиков */
  readings: IBedroomReadings | undefined;
  /** Пользовательские привязки */
  overrides: IBedroomSensorMapping | null;
  /** Открыть picker для слота */
  onConfigureSensor: (slot: string) => void;
}
