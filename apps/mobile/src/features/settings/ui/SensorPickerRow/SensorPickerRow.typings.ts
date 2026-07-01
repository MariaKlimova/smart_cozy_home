import type { TBedroomSensorSlot } from '@/config/bedroomSensorMapping.typings';
import type { IHaEntityListItem } from '@/domain/haEntityList.typings';

/** Пропсы строки выбора датчика */
export interface ISensorPickerRowProps {
  /** Слот */
  slot: TBedroomSensorSlot;
  /** Entity из HA */
  item: IHaEntityListItem;
  /** Выбор строки */
  onPress: () => void;
}
